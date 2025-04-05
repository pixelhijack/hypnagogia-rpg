import { adminDb, FieldValue } from "../../../firebaseAdmin"; // Import Firestore Admin instance
import { verifyFirebaseIdToken, getUserFromFirestore } from "../../../utils/authUtils";

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

export async function POST(req, { params }) {
    const { gameName } = params;
  
    try {
      const decodedToken = await verifyFirebaseIdToken(req);
      let user = await getUserFromFirestore(decodedToken.email);
      const additionalUserInfo = user.games.find((game) => game.gameName === gameName);
  
      // Parse the request body
      const body = await req.json();
      const { text, chapter } = body;
  
      if (!text || text.trim() === "") {
        return new Response(JSON.stringify({ error: "Text is required" }), { status: 400 });
      }
  
      await adminDb.collection("interactions").doc(gameName).set(
        {
          messages: FieldValue.arrayUnion({
            gameName: gameName,
            chapterTitle: chapter.title,
            chapterFilename: chapter.name,
            user: user.email,
            characterName: additionalUserInfo.characterName,
            shortName: additionalUserInfo.shortName,
            text: text.trim(),
            dateUpdated: new Date(),
          }),
        },
        { merge: true } // Merge with existing data instead of overwriting
      );
  
      return new Response(JSON.stringify({ message: "Interaction added successfully" }), { status: 200 });
    } catch (error) {
      console.error("Error in POST /api/game/[gameName]:", error);
      return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), { status: 500 });
    }
  }