'use client'

import styles from './page.module.css';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useData } from './context/DataContext';
import { useAuth } from './layout';


function Landing() {
  const { data: games, setData } = useData();
  const { user, handleSignIn, handleSignOut } = useAuth();

  useEffect(() => {
    if (user && !games) {
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
  }, [user, games]);

  if(!user) {
    return (
      <>
        <h1>Kalandjáték - csak beavatottaknak</h1>
        <p>Meghívott vagy? Próbálj belépni, és kiderül!</p>
        <button onClick={handleSignIn}>Sign In With Google</button>
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
      <h1>Welcome {user.displayName}</h1>
      {
        user && games && games.map(game => (
          <Link key={game.id} href={`/${game.id}`}>{game.name}</Link>
        ))
      }
      <button onClick={handleSignOut}>Sign Out</button>
    </>
  )
}

export default Landing;