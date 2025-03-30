'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useState, useEffect } from "react";
import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useData } from "../../context/DataContext";
import { auth } from "../../firebase"; 
import { signInWithCredential, onAuthStateChanged, GoogleAuthProvider } from "firebase/auth";

function Chapter() {
  const { data: session } = useSession();
  const { data: games, setData } = useData();
  const [firebaseUser, setFirebaseUser] = useState(null); 
  const { game, chapter } = useParams();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFirebaseUser(user); // Firebase user is authenticated
      } else {
        setFirebaseUser(null); // Firebase user is not authenticated
      }
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);

  useEffect(() => {
    if (session?.user?.googleIdToken) {
      const credential = GoogleAuthProvider.credential(session.user.googleIdToken);
      signInWithCredential(auth, credential)
        .then(async (userCredential) => {
          const firebaseIdToken = await userCredential.user.getIdToken();
          // Optionally, store the Firebase ID token in the session or state
        })
        .catch((error) => {
          console.error("Error signing in to Firebase:", error);
        });
    }
  }, [session]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        console.log("Firebase session expired, logging out...");
        signOut(); // Log out the user
      }
    });
  
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (firebaseUser && !games) {
      firebaseUser.getIdToken().then((idToken) => {
        const gameName = "madrapur";
        fetch(`/api/game/${gameName}`, {
          headers: {
            Authorization: `Bearer ${idToken}`, // Pass Firebase ID token in Authorization header
          },
        })
          .then((response) => response.json())
          .then((json) => {
            console.log("CLIENT: /api/games response", json);
            setData(json);
          })
          .catch((error) => {
            console.log("ERROR: /api/games", error);
          });
      });
    }
  }, [firebaseUser, games]);

  if (!session) {
    return (
      <>
        <h1>Kalandjáték - csak beavatottaknak</h1>
        <p>Meghívott vagy? Próbálj belépni, és kiderül!</p>
        <button onClick={() => signIn('google')}>Sign In With Google</button>
      </>
    );
  }

  if (!games) {
    return (
      <>
        <h1>Loading...</h1>
      </>
    );
  }

  return (
    <>
      <h1>{game} - {chapter}</h1>
      {session?.user && games && games.map((game) => (
        <Link key={game.id} href={`/${game.id}`}>{game.name}</Link>
      ))}
      <button onClick={() => signOut()}>Sign Out</button>
    </>
  );
}

export default Chapter;