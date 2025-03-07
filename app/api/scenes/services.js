import fs from 'fs';
import path from 'path';

const GITHUB_REPO = "pixelhijack/rpg-scenes";
const GITHUB_BRANCH = "master";
const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN; // Securely store token
const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL;
const WHICH_RPG_GAME = process.env.WHICH_RPG_GAME;

export function getGameMeta() {
    const gameMetaPath = path.join(process.cwd(), `app/data/games/${WHICH_RPG_GAME}/game.json`);
    const games = JSON.parse(fs.readFileSync(gameMetaPath, 'utf-8'));
    const currentGame = process.env.WHICH_RPG_GAME;
    return games[currentGame] || {};
  }

export async function getGithubFiles() {
    try {
        // 1️ Get list of files in the "scenes" folder
        // https://github.com/pixelhijack/rpg-scenes/tree/master/hypnagogia
        const fileListUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${WHICH_RPG_GAME}?ref=${GITHUB_BRANCH}`;
        
        const fileListResponse = await fetch(fileListUrl, {
            headers: GITHUB_ACCESS_TOKEN ? { Authorization: `token ${GITHUB_ACCESS_TOKEN}` } : {},
        }).catch((error) => {
            console.log('========= GITHUB ACCESS error: ', error);
        });

        console.log('============= fileListResponse.status', fileListResponse.status);

        if (!fileListResponse.ok) throw new Error("Failed to fetch file list");

        const files = await fileListResponse.json();

        // 2️ Extract markdown file URLs
        const markdownFiles = files.filter(file => file.name.endsWith(".md"));

        // 3️ Fetch content of each markdown file
        const scenePromises = markdownFiles.map(async (file) => {
            const fileResponse = await fetch(file.download_url);
            const content = await fileResponse.text();
            return { name: file.name, content };
        });

        const scenes = await Promise.all(scenePromises);
        return scenes;
    } catch(e) {
        console.error("Failed to fetch scene files from GitHub", e);
        return [];
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