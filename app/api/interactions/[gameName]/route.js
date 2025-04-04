import { adminDb } from "../../../firebaseAdmin"; // Import Firestore Admin instance
import { verifyFirebaseIdToken } from "../../../utils/authUtils";

export async function GET(req, { params }) {
  const { gameName } = params;

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

     // Process the interactions data
    const interactionsData = doc.data();
    const formattedInteractions = interactionsData.messages.map((interaction) => {
      let formattedDate = "Unknown Date";

      if (interaction.dateUpdated) {
        if (interaction.dateUpdated.seconds) {
          // Firestore Timestamp format
          formattedDate = new Date(interaction.dateUpdated.seconds * 1000).toLocaleString();
        } else if (typeof interaction.dateUpdated === "string") {
          // ISO string format
          formattedDate = new Date(interaction.dateUpdated).toLocaleString();
        } else if (interaction.dateUpdated instanceof Date) {
          // JavaScript Date object
          formattedDate = interaction.dateUpdated.toLocaleString();
        }
      }

      return {
        ...interaction,
        formattedDate, // Add the formatted date to the interaction object
      };
    });

    return new Response(JSON.stringify({ interactions: formattedInteractions }), { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/interactions/[gameName]:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), { status: 500 });
  }
}