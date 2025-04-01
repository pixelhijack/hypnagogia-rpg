
const GITHUB_REPO = "pixelhijack/rpg-scenes";
const GITHUB_BRANCH = "master";
const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN; // Securely store token


export async function getGithubFiles(gameName = 'madrapur') {
    try {
        // 1️ Get list of files in the "scenes" folder
        // https://github.com/pixelhijack/rpg-scenes/tree/master/hypnagogia
        const fileListUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${gameName}?ref=${GITHUB_BRANCH}`;
        
        const fileListResponse = await fetch(fileListUrl, {
            headers: GITHUB_ACCESS_TOKEN ? { Authorization: `token ${GITHUB_ACCESS_TOKEN}` } : {},
        }).catch((error) => {
            console.log('========= GITHUB ACCESS error: ', error);
        });

        console.log('============= GITHUB request.status', fileListResponse.status);

        if (!fileListResponse.ok) throw new Error("Failed to fetch file list");

        const files = await fileListResponse.json();
        console.log('============= GITHUB files', files);
        
        // 2️ Extract markdown file URLs
        const markdownFiles = files.filter(file => file.name.endsWith(".md"));

        // 3️ Fetch content of each markdown file
        const scenePromises = markdownFiles.map(async (file) => {
            const fileResponse = await fetch(file.download_url);
            const content = await fileResponse.text();
            return { name: file.name, content };
        });

        const scenes = await Promise.all(scenePromises);
        
        // 4️ Get list of files in the "images" folder
        const imageListUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${gameName}/images?ref=${GITHUB_BRANCH}`;
        
        const imageListResponse = await fetch(imageListUrl, {
            headers: GITHUB_ACCESS_TOKEN ? { Authorization: `token ${GITHUB_ACCESS_TOKEN}` } : {},
        }).catch((error) => {
            console.log('========= GITHUB ACCESS error: ', error);
        });

        console.log('============= GITHUB request.status', imageListResponse.status);

        if (!imageListResponse.ok) throw new Error("Failed to fetch image list");

        const images = await imageListResponse.json();
        console.log('============= GITHUB images', images);

        // 5️ Extract image file URLs
        const imageFiles = images.filter(file => file.type === "file");

        // 6️ Generate raw URLs for each image file
        const imageContents = imageFiles.map(file => {
          const rawUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${file.path}`;
          return { name: file.name, url: rawUrl, path: file.path };
        });

        return { sceneFiles: scenes, imageFiles: imageContents };
    } catch(e) {
        console.error("Failed to fetch scene files from GitHub", e);
        return { scenesFiles: [], imageFiles: [] };
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