import { verifyFirebaseIdToken, getUserFromFirestore, getGames } from "../../../utils/authUtils";
import { getGithubFiles, sliceMarkdownByAtNames } from "../../../utils/githubUtils";
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
    
    const characterName = user.games.find((game) => game.gameName === gameName)?.characterName;
    user = { ...user, characterName };

    if (!userGames.some((game) => game.name === gameName)) {
      return new Response(JSON.stringify({ error: "User has not joined this game" }), { status: 403 });
    }

    // Check cache for GitHub files
    const cacheKey = `githubFiles:${gameName}`;
    let githubData = getCache(cacheKey);

    if (!githubData) {
      console.log("==============================");
      console.log("=== NO CACHE === refreshing...");
      console.log("==============================");
      githubData = await getGithubFiles(gameName);
      console.log("=========== githubData", githubData);
      githubData = {
        ...githubData,
        chapters: githubData.chapters.map((chapter) => ({
          ...chapter,
          content: processMarkdownContent(chapter.content, user)
        }))
      };
      setCache(cacheKey, githubData, 60000); // Cache for 60 seconds
    }
    return new Response(JSON.stringify({
      githubData,
      userGames,
      currentGame,
      user,
      games
    }), { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/game/[gameName]:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), { status: 500 });
  }
}

function processMarkdownContent(markdown, user) {
  const slicedByNames = sliceMarkdownByAtNames(markdown);
  //const authorizedContent = slicedByNames.filter(group => group.names.includes(user?.characterName?.toLowerCase()));
  console.log('============= slicedByNames', slicedByNames);
  return slicedByNames
    /*
    .filter(group => group.names.some(
      name => name === user?.characterName?.toLowerCase() || name === "@all"
    ))
    */
    .map(group => marked(group.content))
    .join('').replace(/@\w+/g, '');
}
