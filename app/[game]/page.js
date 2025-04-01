'use client'

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useData } from "../context/DataContext";
import React, { useEffect } from 'react';
import { useAuth } from '../layout';


function Game() {
  const { data, setData } = useData();
  const { user, handleSignIn, handleSignOut } = useAuth();
  const { game } = useParams();

  useEffect(() => {
    if (user && !data) {
      user.getIdToken().then((idToken) => {
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
  }, [user, data]);

  if(!user) {
    return (
      <>
        <h1>Kalandjáték - csak beavatottaknak</h1>
        <p>Meghívott vagy? Próbálj belépni, és kiderül!</p>
        <button onClick={handleSignIn}>Sign In With Google</button>
      </>
    )
  };
  if (!data) {
    return (
      <>
        <h1>Loading...</h1>
      </>
    )
  };

  return (
    <>
      <h1>{game}</h1>
      {
        user && data && data.chapters.map(game => (
          <Link key={game.id} href={`/${game.id}`}>{game.name}</Link>
        ))
      }
      <button onClick={handleSignOut}>Sign Out</button>
    </>
  )
}

export default Game;