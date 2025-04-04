const GITHUB_REPO = "pixelhijack/rpg-scenes";
const GITHUB_BRANCH = "master";
const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN; // Securely store token

// Cache storage for ETags
const etagCache = new Map();

export async function getGithubFiles(gameName = 'madrapur') {
    try {
        const fileListUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${gameName}?ref=${GITHUB_BRANCH}`;
        
        // Check if we have an ETag for this request
        const headers = GITHUB_ACCESS_TOKEN ? { Authorization: `token ${GITHUB_ACCESS_TOKEN}` } : {};
        const cachedEtag = etagCache.get(fileListUrl);
        if (cachedEtag) {
            headers["If-None-Match"] = cachedEtag;
        }

        const fileListResponse = await fetch(fileListUrl, { headers });

        if (fileListResponse.status === 304) {
            console.log("Cache HIT: Using cached data for", fileListUrl);
            return { chapters: [], imageFiles: [] }; // Return cached data here if you store it
        }

        if (!fileListResponse.ok) throw new Error("Failed to fetch file list");

        // Update ETag cache
        const newEtag = fileListResponse.headers.get("ETag");
        if (newEtag) {
            etagCache.set(fileListUrl, newEtag);
        }

        const files = await fileListResponse.json();
        const markdownFiles = files.filter(file => file.name.endsWith(".md"));

        const chapterPromises = markdownFiles.map(async (file) => {
            const fileResponse = await fetch(file.download_url);
            const content = await fileResponse.text();
            return { name: file.name, content };
        });

        const chapters = await Promise.all(chapterPromises);

        const imageListUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${gameName}/images?ref=${GITHUB_BRANCH}`;
        const imageListHeaders = { ...headers };
        const cachedImageEtag = etagCache.get(imageListUrl);
        if (cachedImageEtag) {
            imageListHeaders["If-None-Match"] = cachedImageEtag;
        }

        const imageListResponse = await fetch(imageListUrl, { headers: imageListHeaders });

        if (imageListResponse.status === 304) {
            console.log("Cache HIT: Using cached data for", imageListUrl);
            return { chapters, imageFiles: [] }; // Return cached data here if you store it
        }

        if (!imageListResponse.ok) throw new Error("Failed to fetch image list");

        const newImageEtag = imageListResponse.headers.get("ETag");
        if (newImageEtag) {
            etagCache.set(imageListUrl, newImageEtag);
        }

        const images = await imageListResponse.json();
        const imageFiles = images.filter(file => file.type === "file").map(file => ({
            name: file.name,
            url: `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${file.path}`,
            path: file.path
        }));

        return { chapters, imageFiles };
    } catch (e) {
        console.error("Failed to fetch scene files from GitHub", e);
        return { chapters: [], imageFiles: [] };
    }
}

export function sliceMarkdownByAtNames(markdown) {
    const regex = /(@\w+)/g;
    const parts = markdown.split(regex).filter(Boolean);
    const result = [];
    let currentGroup = { names: [], content: '' };
  
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].startsWith('@')) {
        if (currentGroup.names.length > 0 || currentGroup.content) {
          result.push(currentGroup);
        }
        currentGroup = { names: [parts[i].substring(1)], content: '' };
      } else {
        currentGroup.content += parts[i].replace(/@\w+/g, '');
      }
    }
  
    if (currentGroup.names.length > 0 || currentGroup.content) {
      result.push(currentGroup);
    }
  
    // Merge groups with empty content
    for (let i = 0; i < result.length - 1; i++) {
      if (result[i].content.trim() === '') {
        result[i + 1].names = [...result[i].names, ...result[i + 1].names];
        result.splice(i, 1);
        i--; // Adjust index after removal
      }
    }
  
    return result;
  }