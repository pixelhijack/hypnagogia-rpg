import { adminDb } from "../../../firebaseAdmin"; // Import Firestore Admin instance
import { verifyFirebaseIdToken } from "../../../utils/authUtils";

export async function GET(req, { params }) {
  const { gameName } = params;
  // Parse query parameters
  const url = new URL(req.url, `http://${req.headers.host}`);
  const chapterName = url.searchParams.get("chapterName");

  try {
    // Verify the Firebase ID token
    const decodedToken = await verifyFirebaseIdToken(req);

    if (!decodedToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // Fetch the interactions document for the specified gameName
    const doc = await adminDb.collection("interactions").doc(gameName).get();

    if (!doc.exists) {
      return new Response(JSON.stringify({ error: "No interactions found for this game" }), { status: 404 });
    }

    const interactionsData = doc.data();
    const filteredInteractions = interactionsData.messages.filter(
        (interaction) =>
          !interaction.text.toLowerCase().includes("@dm") && // Exclude messages with sent to the DM
          (!chapterName || interaction.chapterFilename === chapterName) // only send messages from the selected chapter
      );

    return new Response(JSON.stringify({ interactions: filteredInteractions }), { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/interactions/[gameName]:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), { status: 500 });
  }
}