const GITHUB_REPO = "pixelhijack/rpg-scenes";
const GITHUB_BRANCH = "master";
const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN; // Securely store token

export async function getGithubFiles(gameName = 'madrapur') {
  try {
    const fileListUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${gameName}?ref=${GITHUB_BRANCH}`;
    const headers = GITHUB_ACCESS_TOKEN ? { Authorization: `token ${GITHUB_ACCESS_TOKEN}` } : {};

    const fileListResponse = await fetch(fileListUrl, { headers });

    if (!fileListResponse.ok) throw new Error("Failed to fetch file list");

    const files = await fileListResponse.json();
    const markdownFiles = files.filter(file => file.name.endsWith(".md"));

    const chapterPromises = markdownFiles.map(async (file) => {
      const fileResponse = await fetch(file.download_url);
      const content = await fileResponse.text();
      const title = extractTitleFromMarkdown(content);
      return { 
        name: file.name, 
        content,
        title 
      };
    });

    const chapters = await Promise.all(chapterPromises);

    /*
    const imageListUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${gameName}/images?ref=${GITHUB_BRANCH}`;
    const imageListResponse = await fetch(imageListUrl, { headers });

    if (!imageListResponse.ok) throw new Error("Failed to fetch image list");

    const images = await imageListResponse.json();
    const imageFiles = images.filter(file => file.type === "file").map(file => ({
      name: file.name,
      url: `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${file.path}`,
      path: file.path
    }));
    */
    return { chapters };
  } catch (e) {
    console.error("Failed to fetch scene files from GitHub", e);
    return { chapters: [] };
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

  export function extractTitleFromMarkdown(content) {
    // Remove @name references
    const cleanedContent = content.replace(/@\w+/g, '').trim();

    // Find the first H1 line (starting with #)
    const h1Match = cleanedContent.match(/^#\s*(.+)$/m);
    if (h1Match) {
        return h1Match[1].trim(); // Return the H1 title without markdown syntax
    }

    // If no H1 is found, use the first 100 characters as the title
    const plainText = cleanedContent
        .replace(/[#*_`~>\-\[\]()]/g, '') // Remove markdown-specific characters
        .replace(/\s+/g, ' ') // Replace multiple spaces/newlines with a single space
        .trim();

    return plainText.substring(0, 100); // Return the first 100 characters
}