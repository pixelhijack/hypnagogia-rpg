import { verifyFirebaseIdToken, getUserFromFirestore, getGames } from "../../utils/authUtils";
import { getGithubFiles } from "../../utils/githubUtils";
import { getCache, setCache } from "../../utils/cache";

export async function GET(req, { params }) {
  const gameName = params?.gameName || 'madrapur';
  console.log("==============================");
  console.log(`=== /api/games/${gameName}`, params);
  console.log("==============================");

  try {
    const decodedToken = await verifyFirebaseIdToken(req);
    const user = await getUserFromFirestore(decodedToken.email);
    const games = await getGames();
    const userGames = games.filter((game) => user.games.map(game => game.gameName)?.includes(game.id));

    if (!userGames.some((game) => game.name === gameName)) {
      return new Response(JSON.stringify({ error: "Game not found or access denied" }), { status: 403 });
    }

    /*/ Check cache for GitHub files
    const cacheKey = `githubFiles:${gameName}`;
    let githubData = getCache(cacheKey);

    if (!githubData) {
      console.log("==============================");
      console.log("=== NO CACHE === refreshing...");
      console.log("==============================");
      githubData = await getGithubFiles(gameName);
      setCache(cacheKey, githubData, 60000); // Cache for 60 seconds
    }
      */
    return new Response(JSON.stringify({
      games,
      userGames
    }), { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/game/[gameName]:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), { status: 500 });
  }
}