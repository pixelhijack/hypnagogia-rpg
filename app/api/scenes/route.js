import fs from "fs";
import path from "path";
import { marked } from "marked";
import { getServerSession } from "next-auth"; // Correct import for App Router
import { authOptions } from "../auth/[...nextauth]/route"; // Adjust based on your setup
import manifest from '../../data/manifest.json';
import { getGithubFiles, sliceMarkdownByAtNames } from "./services";

const GITHUB_REPO = "pixelhijack/rpg-scenes";
const GITHUB_BRANCH = "master";
const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN; // Securely store token
const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL;
  

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  //const remoteGithubFiles = await getGithubFiles();

  return getGithubFiles().then((files) => {
    const players = JSON.parse(fs.readFileSync(path.join(process.cwd(), "app/data/players.json"), "utf-8"));
    // view as: 
    const player = players.find(p => p.email === "imreta@gmail.com");
    //const player = players.find(p => p.email === session.user.email);
    console.log('========= remoteGithubFiles', player, files.length);

    const sceneMetas = Object.values(manifest).filter(scene => scene.players.includes(player.email));

    const scenes = sceneMetas.map(scene => {
        const markdown = files.find(file => file.name === `${scene.id}.md`)?.content || '';
        const parsed = marked(markdown);
        // [ { names: ['@dm'], content: '...' }, { names: ['@player1'], content: '...' } ]
        const slicedByNames = sliceMarkdownByAtNames(parsed);
        const authorizedContent = player.shortName === 'dm' ? slicedByNames : slicedByNames.filter(group => group.names.includes(player.shortName));
        console.log('============= slicedByNames', player.shortName, authorizedContent.length);
        return { 
            id: scene.id, 
            title: scene.title, 
            startDate: scene.startDate,
            endDate: scene.endDate,
            content: authorizedContent.map(group => group.content).join('').replace(/@\w+/g, ''), 
            slicedByNames 
        };
    });
    console.log('========= GET /api/scenes player', player);
  
    return Response.json({player, scenes});
  }).catch((error) => {
    console.log('========= GET /api/scenes error: ', error);
  });
}

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  
    try {
        const body = await req.json(); // Parse the request body
        const { sceneId, content } = body;
  
        // get player character name
        const players = JSON.parse(fs.readFileSync(path.join(process.cwd(), "app/data/players.json"), "utf-8"));
        const player = players.find(p => p.email === session.user.email);
        // get scene file which is updated, push a message
        const sceneFiles = fs.readdirSync(path.join(process.cwd(), "app/data/scenes"));
        const sceneToUpdate = sceneFiles
            .map(file => {
                const scene = JSON.parse(fs.readFileSync(path.join(process.cwd(), "app/data/scenes", file), "utf-8"));
                return scene;
            })
            .find(scene => scene.id === sceneId);
        
        const messagesByUser = sceneToUpdate.messages.filter(message => message.character === player.character);

        console.log('========= POST /api/scenes', player, sceneToUpdate);

        if(messagesByUser.length > 3) {
            return new Response(JSON.stringify({ error: "Too many messages" }), { status: 500 });
        }
        sceneToUpdate.messages.push({ 
            character: player.character,
            updated: new Date().toISOString(), 
            content 
        });

        // save file
        const sceneFilePath = path.join(process.cwd(), "app/data/scenes", `${sceneId}.json`);
        fs.writeFileSync(sceneFilePath, JSON.stringify(sceneToUpdate, null, 2));


        // log to google spreadsheet: 
        await fetch(googleScriptUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ scene: sceneId, player: player.character, message: content }),
          });

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        console.error('Error parsing request body:', error);
        return new Response(JSON.stringify({ error: "Internal Server Error: api/scenes/route.js" }), { status: 500 });
    }
  };
