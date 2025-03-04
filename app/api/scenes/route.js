import fs from "fs";
import path from "path";
import { marked } from "marked";
import { getServerSession } from "next-auth"; // Correct import for App Router
import { authOptions } from "../auth/[...nextauth]/route"; // Adjust based on your setup
import manifest from '../../data/manifest.json';

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const players = JSON.parse(fs.readFileSync(path.join(process.cwd(), "app/data/players.json"), "utf-8"));
  const player = players.find(p => p.email === session.user.email);

  const sceneDescriptors = Object.values(manifest).filter(scene => scene.players.includes(session.user.email));

    const scenes = sceneDescriptors.map(scene => {
        const markdown = fs.readFileSync(path.join(process.cwd(), "app/data/md", `${scene.id}.md`), "utf-8");
        const parsed = marked(markdown);
        const slicedContent = sliceMarkdownByAtNames(markdown);
        console.log('============= slicedContent', slicedContent);
        return { id: scene.id, title: scene.title, content: parsed.replace(/@\w+/g, ''), slicedContent };
    });
    console.log('========= GET /api/scenes', player);
  
  return Response.json({player, scenes});
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


        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        console.error('Error parsing request body:', error);
        return new Response(JSON.stringify({ error: "Internal Server Error: api/scenes/route.js" }), { status: 500 });
    }
  }

  function sliceMarkdownByAtNames(markdown) {
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

  /*  
  export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const players = JSON.parse(fs.readFileSync(path.join(process.cwd(), "app/data/players.json"), "utf-8"));
  const player = players.find(p => p.email === session.user.email);
  const sceneFiles = fs.readdirSync(path.join(process.cwd(), "app/data/scenes"));
  const scenes = sceneFiles
    .map(file => {
        const scene = JSON.parse(fs.readFileSync(path.join(process.cwd(), "app/data/scenes", file), "utf-8"));
        return scene;
    })
    .filter(scene => scene.players.includes(session.user.email));
  console.log('========= GET /api/scenes', player);
  
  return Response.json({player, scenes});
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


        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        console.error('Error parsing request body:', error);
        return new Response(JSON.stringify({ error: "Internal Server Error: api/scenes/route.js" }), { status: 500 });
    }
  }
  
  
  */