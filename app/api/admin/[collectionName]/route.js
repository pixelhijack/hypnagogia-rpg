import { adminDb } from "../../../firebaseAdmin";
import { verifyFirebaseIdToken, getUserFromFirestore } from "../../../utils/authUtils";

export async function GET(req, { params }) {
  const { collectionName } = params;

  if (process.env.NODE_ENV === "production") {
    return new Response(JSON.stringify({ error: "Not in prod, baby" }), { status: 403 });
  }

  try {
    const decodedToken = await verifyFirebaseIdToken(req);
    let user = await getUserFromFirestore(decodedToken.email);
    if (user.email !== "pothattila@gmail.com" && user.email !== "hhanuman@gmail.com") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    // Fetch the collection
    const snapshot = await adminDb.collection(collectionName).get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error("Error fetching collection:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

export async function POST(req, { params }) {
    const { collectionName } = params;
  
    if (process.env.NODE_ENV === "production") {
      return new Response(JSON.stringify({ error: "Not in prod, baby" }), { status: 403 });
    }
  
    try {
      // Verify the user is authorized
      const decodedToken = await verifyFirebaseIdToken(req);
      let user = await getUserFromFirestore(decodedToken.email);
      if (user.email !== "pothattila@gmail.com" && user.email !== "hhanuman@gmail.com") {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
      }
  
      // Parse the submitted JSON
      const body = await req.json();
      if (!Array.isArray(body)) {
        return new Response(JSON.stringify({ error: "Invalid data format" }), { status: 400 });
      }
  
      // Batch update the collection
      const batch = adminDb.batch();
      body.forEach((item) => {
        if (!item.id) {
          throw new Error("Each item must have an 'id' field to match the document ID in Firestore.");
        }
  
        const docRef = adminDb.collection(collectionName).doc(item.id);
        batch.set(docRef, item, { merge: true }); // Use merge: true to update fields without overwriting
      });
      await batch.commit();
  
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
      console.error("Error updating collection:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
  }