'use client'

import styles from './page.module.css'
import { signIn, signOut, useSession, getSession } from 'next-auth/react'
import { useState, useEffect } from "react";
import React from 'react'
import Link from 'next/link';
import { useData } from "./context/DataContext";
import { getAuth, signInWithCredential, onAuthStateChanged, GoogleAuthProvider } from "firebase/auth";
import { auth } from "./firebase";


function Landing() {
  const { data: session } = useSession();
  const { data: games, setData } = useData();
  const [firebaseUser, setFirebaseUser] = useState(null); 

  useEffect(() => {
    const firebaseAuth = getAuth();
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        setFirebaseUser(user); // Firebase user is authenticated
      } else {
        setFirebaseUser(null); // Firebase user is not authenticated
      }
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);
  
  useEffect(() => {
    const refreshFirebaseSession = async () => {
      if (session?.user?.googleIdToken) {
        try {
          const credential = GoogleAuthProvider.credential(session.user.googleIdToken);
          await signInWithCredential(auth, credential);
          console.log("Firebase session refreshed");
        } catch (error) {
          console.error("Error refreshing Firebase session:", error);

          // If the Google OAuth ID token is stale, refresh the session
          if (error.code === "auth/invalid-credential") {
            const refreshedSession = await getSession(); // Refresh the session
            if (refreshedSession?.user?.googleIdToken) {
              const newCredential = GoogleAuthProvider.credential(refreshedSession.user.googleIdToken);
              await signInWithCredential(auth, newCredential);
              console.log("Firebase session refreshed with new Google ID token");
            }
          }
        }
      }
    };

    refreshFirebaseSession();
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
        fetch("/api/games", {
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

  if(!session) {
    return (
      <>
        <h1>Kalandjáték - csak beavatottaknak</h1>
        <p>Meghívott vagy? Próbálj belépni, és kiderül!</p>
        <button onClick={() => signIn('google')}>Sign In With Google</button>
      </>
    )
  };
  if (!games) {
    return (
      <>
        <h1>Loading...</h1>
      </>
    )
  };

  return (
    <>
      <h1>Welcome</h1>
      {
        session?.user && games && games.map(game => (
          <Link key={game.id} href={`/${game.id}`}>{game.name}</Link>
        ))
      }
      <button onClick={() => signOut()}>Sign Out</button>
    </>
  )
}

export default Landing;