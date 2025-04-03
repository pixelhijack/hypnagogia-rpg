import { adminAuth, adminDb } from "../firebaseAdmin";

export async function verifyFirebaseIdToken(req) {
  const firebaseIdToken = req.headers.get("authorization")?.split("Bearer ")[1];

  if (!firebaseIdToken) {
    throw new Error("Missing Firebase ID token");
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(firebaseIdToken);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying Firebase ID token:", error);
    throw new Error("Unauthorized");
  }
}

export async function getUserFromFirestore(email) {
  const usersSnapshot = await adminDb.collection("users").get();
  const users = usersSnapshot.docs.map((doc) => doc.data());
  console.log("users", users);
  const user = users.find((user) => user.email === email);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function getUserGames(user) {
  const gamesSnapshot = await adminDb.collection("games").get();
  const games = gamesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return games.filter((game) => user.games?.includes(game.id));
}

export async function getGames() {
    const gamesSnapshot = await adminDb.collection("games").get();
    const games = gamesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return games;
}