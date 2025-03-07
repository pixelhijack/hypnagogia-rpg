import fs from "fs";
import path from "path";
import { getServerSession } from "next-auth"; // Correct import for App Router
import { authOptions } from "../../auth/[...nextauth]/route"; // Adjust based on your setup
import { getGithubFiles, sliceMarkdownByAtNames } from "../../scenes/services";
import { marked } from "marked";

export async function GET(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    console.log(`========= /api/help/${params.playerEmail}/route.js`, session.user, params);
    
    if (!(session.user.email === "hhanuman@gmail.com" || session.user.email === "pothattila@gmail.com")){ 
        return new Response(JSON.stringify({ error: "Unauthorized: only DM" }), { status: 401 })
    };
    
    // scenes/imreta@gmail.com => api/scenes/["imreta@gmail.com"] => playerEmail = "imreta@gmail.com"
    const { playerEmail } = params; 

    return getGithubFiles().then((files) => {
        console.log('========= remoteGithubFiles', files.length);
        const players = JSON.parse(fs.readFileSync(path.join(process.cwd(), "app/data/players.json"), "utf-8"));
        const player = players.find(p => p.email === playerEmail);
    
        // Read the manifest file synchronously
        const manifestPath = path.join(process.cwd(), `app/data/manifest/${process.env.WHICH_RPG_GAME}.json`);
        const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

        const sceneMetas = Object.values(manifest.scenes).filter(scene => scene.players.includes(player.email));
    
        const scenes = sceneMetas.map(scene => {
            const markdown = files.find(file => file.name === `${scene.id}.md`)?.content || '';
            const parsed = marked(markdown);
            // [ { names: ['@dm'], content: '...' }, { names: ['@player1'], content: '...' } ]
            const slicedByNames = sliceMarkdownByAtNames(parsed);
            const authorizedContent = slicedByNames.filter(group => group.names.includes(player.shortName));
            console.log('============= slicedByNames', playerEmail, authorizedContent.length);
            return { 
                id: scene.id, 
                title: scene.title, 
                startDate: scene.startDate,
                endDate: scene.endDate,
                content: authorizedContent.map(group => group.content).join('').replace(/@\w+/g, ''), 
                slicedByNames 
            };
        });
      
        return Response.json({player, scenes, game: manifest.game});
    }).catch((error) => {
        console.log('========= GET /api/help/[playerEmail]/route.js error: ', error);
    });
}

