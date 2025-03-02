import fs from "fs";
import path from "path";
import { getServerSession } from "next-auth"; // Correct import for App Router
import { authOptions } from "../auth/[...nextauth]/route"; // Adjust based on your setup

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
  console.log('========= scenePath', player, scenes);
  
  return Response.json({player, scenes});
}

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  
    try {
        const body = await req.json(); // Parse the request body
        console.log('========= POST', body);
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
        
        sceneToUpdate.messages.push({ 
            player: session.user.name,
            updated: new Date().toISOString(), 
            content 
        });
        console.log('========= sceneToUpdate', sceneToUpdate);

        // save file
        const sceneFilePath = path.join(process.cwd(), "app/data/scenes", `${sceneId}.json`);
        fs.writeFileSync(sceneFilePath, JSON.stringify(sceneToUpdate, null, 2));


        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        console.error('Error parsing request body:', error);
        return new Response(JSON.stringify({ error: "Internal Server Error: api/scenes/route.js" }), { status: 500 });
    }
  }