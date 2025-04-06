import { adminDb } from "../../firebaseAdmin"; // Firestore Admin instance
import { verifyFirebaseIdToken } from "../../utils/authUtils";

export async function POST(req) {
  try {
    // Verify the Firebase ID token
    const decodedToken = await verifyFirebaseIdToken(req);

    if (!decodedToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // Parse the request body to get the game ID
    const body = await req.json();
    const { gameId } = body;

    if (!gameId) {
      return new Response(JSON.stringify({ error: "Game ID is required" }), { status: 400 });
    }

    // Add the user to the "joining" collection in Firestore
    await adminDb.collection("joining").add({
      gameId,
      name: decodedToken.name,
      email: decodedToken.email,
      joinedAt: new Date(),
    });

    return new Response(JSON.stringify({ message: "Successfully joined the game" }), { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/joining:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), { status: 500 });
  }
}