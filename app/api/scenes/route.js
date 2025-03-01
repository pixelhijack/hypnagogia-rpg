import fs from "fs";
import path from "path";
import { getServerSession } from "next-auth"; // Correct import for App Router
import { authOptions } from "../auth/[...nextauth]/route"; // Adjust based on your setup

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const scenes = ["scene 1", "scene 2"];
  console.log('========= scenePath', scenes);
  
  return Response.json(scenes);
}