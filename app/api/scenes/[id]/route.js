import fs from "fs";
import path from "path";
import { getServerSession } from "next-auth"; // Correct import for App Router
import { authOptions } from "../../auth/[...nextauth]/route"; // Adjust based on your setup

export async function GET(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    console.log('========= /api/[id]/route.js', session.user, params);
    
    if (!(session.user.email === "hhanuman@gmail.com" || session.user.email === "pothattila@gmail.com")){ 
        return new Response(JSON.stringify({ error: "Unauthorized: only DM" }), { status: 401 })
    };
    const { id } = params; 
    const filePath = path.join(process.cwd(), `app/data/scenes/${id}.json`);
    if (!fs.existsSync(filePath)) {
        return new Response(JSON.stringify({ error: "File not found" }), { status: 404 });
    }
    const file = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    
    return Response.json(file);
}