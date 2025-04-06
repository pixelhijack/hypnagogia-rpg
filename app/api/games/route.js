import { verifyFirebaseIdToken, getUserFromFirestore, getGames } from "../../utils/authUtils";
import { getGithubFiles } from "../../utils/githubUtils";
import { getCache, setCache } from "../../utils/cache";

export async function GET(req, { params }) {
  const gameName = params?.gameName;
  console.log("==============================");
  console.log(`=== /api/games/${gameName}`, params);
  console.log("==============================");

  try {
    let user = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const decodedToken = await verifyFirebaseIdToken(req);
      user = await getUserFromFirestore(decodedToken.email);
    }

    const games = await getGames();

    if (!user) {
      return new Response(JSON.stringify({ 
        games: games?.filter(game => game.availability !== 'private') 
      }), { status: 200 });
    }

    const userGames = games.filter((game) => user.games.map(game => game.gameName)?.includes(game.id));

    return new Response(JSON.stringify({
      games,
      userGames
    }), { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/game/[gameName]:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), { status: 500 });
  }
}