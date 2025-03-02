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