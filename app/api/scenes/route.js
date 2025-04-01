import fs from "fs";
import path from "path";
import { marked } from "marked";
import { Resend } from 'resend';
import { getServerSession } from "next-auth"; // Correct import for App Router
import { authOptions } from "../auth/[...nextauth]/route"; // Adjust based on your setup
import { getGithubFiles, sliceMarkdownByAtNames } from "./services";

const GITHUB_REPO = "pixelhijack/rpg-scenes";
const GITHUB_BRANCH = "master";
const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN; // Securely store token
const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL;


export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  //const remoteGithubFiles = await getGithubFiles();

  return getGithubFiles().then(({chapters, imageFiles}) => {
    // Read the manifest file synchronously
    const manifestPath = path.join(process.cwd(), `app/data/manifest/${process.env.WHICH_RPG_GAME}.json`);
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    
    // view as: 
    //const player = players.find(p => p.email === "imreta@gmail.com");
    const player = manifest.players.find(p => p.email === session.user.email);
    console.log('========= remoteGithubFiles', player, chapters.length);

    const sceneMetas = Object.values(manifest.scenes).filter(scene => scene.players.includes(player.email));

    const scenes = sceneMetas.map(scene => {
        const markdown = chapters.find(file => file.name === `${scene.id}.md`)?.content || '';
        const parsed = marked(markdown);
        // [ { names: ['@dm'], content: '...' }, { names: ['@player1'], content: '...' } ]
        const slicedByNames = sliceMarkdownByAtNames(parsed);
        const authorizedContent = player.shortName === 'dm' ? slicedByNames : slicedByNames.filter(group => group.names.includes(player.shortName));
        console.log('============= MARKDOWNS', player.shortName, markdown);
        return { 
            id: scene.id, 
            title: scene.title, 
            startDate: scene.startDate,
            endDate: scene.endDate,
            content: authorizedContent.map(group => group.content).join('').replace(/@\w+/g, ''), 
            slicedByNames,
            parsed,
            image: scene.image 
        };
    });
    console.log('========= GET /api/scenes player', player);
  
    return Response.json({player, scenes, images: imageFiles, game: manifest.game});
  }).catch((error) => {
    console.log('========= GET /api/scenes error: ', error);
  });
}

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const body = await req.json(); // Parse the request body
        const { sceneId, content } = body;
  
        // Read the manifest file synchronously
        const manifestPath = path.join(process.cwd(), `app/data/manifest/${process.env.WHICH_RPG_GAME}.json`);
        const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
        
        const player = manifest.players.find(p => p.email === session.user.email);
        
        console.log('========= POST /api/scenes', player);


        // log to google spreadsheet: 
        await fetch(googleScriptUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scene: sceneId, player: player.character, message: content }),
        });

        // email notification w/ resend
        const { data, error } = await resend.emails.send({
          from: `${process.env.WHICH_RPG_GAME} <onboarding@resend.dev>`,
          to: ['pothattila@gmail.com'],
          subject: `New message from ${player.character} in scene ${sceneId}`,
          html: content,
        });

        if (error) {
          console.error('========= POST /api/scenes RESEND error', error);
          return new Response(JSON.stringify({ error: "Internal Server Error: api/scenes/route.js" }), { status: 500 });
        }
        if(data) console.log('========= POST /api/scenes RESEND data', data); 

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        console.error('Error parsing request body:', error);
        return new Response(JSON.stringify({ error: "Internal Server Error: api/scenes/route.js" }), { status: 500 });
    }
  };
