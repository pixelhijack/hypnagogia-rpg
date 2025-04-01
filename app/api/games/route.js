import { verifyFirebaseIdToken, getUserFromFirestore, getUserGames } from "../../utils/authUtils";
import { getGithubFiles } from "../../utils/githubUtils";
import { getCache, setCache } from "../../utils/cache";

export async function GET(req, { params }) {
  const gameName = params?.gameName || 'madrapur';

  try {
    const decodedToken = await verifyFirebaseIdToken(req);
    const user = await getUserFromFirestore(decodedToken.email);
    const userGames = await getUserGames(user);

    if (!userGames.some((game) => game.name === gameName)) {
      return new Response(JSON.stringify({ error: "Game not found or access denied" }), { status: 403 });
    }

    // Check cache for GitHub files
    const cacheKey = `githubFiles:${gameName}`;
    let githubData = getCache(cacheKey);

    if (!githubData) {
      console.log("==============================");
      console.log("=== NO CACHE === refreshing...");
      console.log("==============================");
      const githubData = await getGithubFiles(gameName);
      setCache(cacheKey, githubData, 60000); // Cache for 60 seconds
    }

    return new Response(JSON.stringify(githubData), { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/game/[gameName]:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), { status: 500 });
  }
}