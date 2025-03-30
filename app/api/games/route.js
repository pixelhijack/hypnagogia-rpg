import { getServerSession } from "next-auth";
import { adminAuth, adminDb } from "../../firebaseAdmin";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req) {
  try {
    const firebaseIdToken = req.headers.get("authorization")?.split("Bearer ")[1];

    if (!firebaseIdToken) {
      return new Response(JSON.stringify({ error: "Missing Firebase ID token" }), { status: 401 });
    }

    // Verify the Firebase ID token using the Firebase Admin SDK
    const decodedToken = await adminAuth.verifyIdToken(firebaseIdToken);
    if (!decodedToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const userEmail = decodedToken.email;

    // Query Firestore for users and games
    const usersSnapshot = await adminDb.collection("users").get();
    const gamesSnapshot = await adminDb.collection("games").get();

    const users = usersSnapshot.docs
      .map((doc) => doc.data())[0];

    const user = Object.values(users).find((user) => user.email === userEmail)  
      console.log("/API/GAMES users, user: ", users, user);
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    const games = gamesSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
    const userGames = games
      .filter((game) => user.games?.includes(game.id));

    return new Response(JSON.stringify(userGames), { status: 200 });
  } catch (error) {
    console.error("Error fetching games:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}