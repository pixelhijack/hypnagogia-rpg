import { verifyFirebaseIdToken, getUserFromFirestore, getGames } from "../../../utils/authUtils";
import { getGithubFiles, sliceMarkdownByAtNames, extractTitleFromMarkdown } from "../../../utils/githubUtils";
import { getCache, setCache } from "../../../utils/cache";
import { marked } from "marked";

export async function GET(req, { params }) {
  const { gameName } = params;
  console.log("==============================");
  console.log(`=== /api/games/${gameName}`, params);
  console.log("==============================");

  try {
    const decodedToken = await verifyFirebaseIdToken(req);
    let user = await getUserFromFirestore(decodedToken.email);
    const games = await getGames();
    const currentGame = games.find((game) => game.name === gameName);
    if (!currentGame) {
      return new Response(JSON.stringify({ error: "Game not found" }), { status: 404 });
    }

    const userGames = games.filter((game) => user.games.map(game => game.gameName)?.includes(game.name));
    
    const additionalUserInfo = user.games.find((game) => game.gameName === gameName);
    
    if (!additionalUserInfo?.characterName) {
      return new Response(JSON.stringify({ 
        error: "Ehhez a játékhoz nem csatlakoztál még mint játékos." 
      }), { status: 404 });
    }

    user = { 
      ...user, 
      characterName: additionalUserInfo.characterName, 
      shortName: additionalUserInfo.shortName 
    };

    // Check cache for GitHub files
    const cacheKey = `githubFiles:${gameName}`;
    let githubData = getCache(cacheKey);

    if (!githubData) {
      console.log("==============================");
      console.log("=== NO CACHE === refreshing...");
      console.log("==============================");
      githubData = await getGithubFiles(gameName);
      githubData = {
        ...githubData,
        chapters: githubData.chapters.map((chapter) => ({
          ...chapter,
          content: processMarkdownContent(chapter.content, user)
        })).filter((chapter) => chapter.content.length > 0)
      };
      setCache(cacheKey, githubData, 60000); // Cache for 60 seconds
    }
    return new Response(JSON.stringify({
      githubData,
      userGames,
      currentGame,
      games
    }), { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/game/[gameName]:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), { status: 500 });
  }
}

function processMarkdownContent(markdown, user) {
  const slicedByNames = sliceMarkdownByAtNames(markdown);
  const authorizedContent = user.shortName === 'dm'
    ? slicedByNames // If the user is 'dm', include all groups
    : slicedByNames.filter(group =>
        group.names.some(name =>
          name.toLowerCase() === user.shortName || name === '@all'
        )
      );

  const mdToHTML = authorizedContent
    .map(group => marked(group.content))
    .join('').replace(/@\w+/g, '');
  return mdToHTML;
}


