import fs from "fs";
import path from "path";
import { getServerSession } from "next-auth"; // Correct import for App Router
import { authOptions } from "../../auth/[...nextauth]/route"; // Adjust based on your setup
import { getGithubFiles, sliceMarkdownByAtNames } from "../services";
import manifest from '../../../data/manifest.json';
import { marked } from "marked";

export async function GET(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    console.log('========= /api/[id]/route.js', session.user, params);
    
    if (!(session.user.email === "hhanuman@gmail.com" || session.user.email === "pothattila@gmail.com")){ 
        return new Response(JSON.stringify({ error: "Unauthorized: only DM" }), { status: 401 })
    };
    
    // scenes/imreta@gmail.com => api/scenes/["imreta@gmail.com"] => playerEmail = "imreta@gmail.com"
    const { playerEmail } = params; 

    return getGithubFiles().then((files) => {
        console.log('========= remoteGithubFiles', files.length);
        const players = JSON.parse(fs.readFileSync(path.join(process.cwd(), "app/data/players.json"), "utf-8"));
        const player = players.find(p => p.email === session.user.email);
    
        const sceneMetas = Object.values(manifest).filter(scene => scene.players.includes(session.user.email));
    
        const scenes = sceneMetas.map(scene => {
            const markdown = files.find(file => file.name === `${scene.id}.md`)?.content || '';
            const parsed = marked(markdown);
            // [ { names: ['@dm'], content: '...' }, { names: ['@player1'], content: '...' } ]
            const slicedByNames = sliceMarkdownByAtNames(parsed);
            const authorizedContent = slicedByNames.filter(group => group.names.includes(playerEmail));
            console.log('============= slicedByNames', player.shortName, authorizedContent);
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
      
        const formattedResponse = JSON.stringify(scenes, null, 2);
        return new Response(formattedResponse, {
            headers: { "Content-Type": "application/json" },
            status: 200
        });
    }).catch((error) => {
        console.log('========= GET /api/scenes error: ', error);
    });
}

