'use client';

import { useState, useEffect } from "react";
import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useData } from "../../context/DataContext";
import { auth } from "../../firebase"; 
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";


function Chapter() {
  const { data: games, setData } = useData();
  const { game, chapter } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Set the authenticated user
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("User signed in:", result.user);
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log("User signed out");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    if (user && !games) {
      user.getIdToken().then((idToken) => {
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
  }, [user, games]);

  if (!user) {
    return (
      <>
        <h1>Kalandjáték - csak beavatottaknak</h1>
        <p>Meghívott vagy? Próbálj belépni, és kiderül!</p>
        <button onClick={handleSignIn}>Sign In With Google</button>
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
      {user && games && games.map((game) => (
        <Link key={game.id} href={`/${game.id}`}>{game.name}</Link>
      ))}
      <button onClick={handleSignOut}>Sign Out</button>
    </>
  );
}

export default Chapter;