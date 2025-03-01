import fs from "fs";
import path from "path";
import { getServerSession } from "next-auth"; // Correct import for App Router
import { authOptions } from "../auth/[...nextauth]/route"; // Adjust based on your setup

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const sceneFiles = fs.readdirSync(path.join(process.cwd(), "app/data/scenes"));
  const scenes = sceneFiles.map(file => {
    const scene = JSON.parse(fs.readFileSync(path.join(process.cwd(), "app/data/scenes", file), "utf-8"));
    return scene.players.includes(session.user.email) ? scene : null;
  }).filter(Boolean);
  console.log('========= scenePath', scenes);
  
  return Response.json(scenes);
}