import { verifyFirebaseIdToken, getUserFromFirestore, getGames } from "../../utils/authUtils";
import { getGithubFiles } from "../../utils/githubUtils";
import { getCache, setCache } from "../../utils/cache";

export async function GET(req, { params }) {
  const gameName = params?.gameName;
  console.log("==============================");
  console.log(`=== /api/games/${gameName}`, params);
  console.log("==============================");

  try {
    const decodedToken = await verifyFirebaseIdToken(req);
    //const user = await getUserFromFirestore(decodedToken.email);
    const user = await getUserFromFirestore("imreta@gmail.com");
    const games = await getGames();
    const userGames = games.filter((game) => user.games.map(game => game.gameName)?.includes(game.id));

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found, access denied" }), { status: 403 });
    }

    return new Response(JSON.stringify({
      games,
      userGames
    }), { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/game/[gameName]:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), { status: 500 });
  }
}