'use client'

import styles from './page.module.css';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useData } from './context/DataContext';
import { useAuth } from './layout';


function Landing() {
  const [data, setData]  = useState();
  const { user, handleSignIn, handleSignOut } = useAuth();

  useEffect(() => {
    if (user && !data && !data?.error) {
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
            setData({ error: "Disaster happened. Please try again later." });
          });
      });
    }
  }, [user, data]);

  console.log("CLIENT: Landing state", data);

  if(!user) {
    return (
      <>
        <h1>Kalandjáték - csak beavatottaknak</h1>
        <p>Meghívott vagy? Próbálj belépni, és kiderül!</p>
        <button onClick={handleSignIn}>Sign In With Google</button>
      </>
    )
  };

  if (data?.error) {
    return (
      <>
        <h1>{data.error}</h1>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <h1>Loading...</h1>
      </>
    )
  };

  return (
    <>
      <h1>Isten hozott, {user.displayName}</h1>
      <h2>Aktív történeteid:</h2>
      {
        user && data && data?.userGames?.map((game, i) => (
          <Link key={i} href={`/${game.id}`} style={{ textDecoration: 'none' }}>
            <div className={'gameCard'} style={{ backgroundImage: `url(${game.coverImage})` }}>
              <h2>
                <span className="highlightedText">{game.name}</span>
              </h2>
              <p>
                <span className="highlightedText">{game.introduction}</span>
              </p>
            </div>
          </Link>
        ))
      }
      <h2>Más történetek, amikre jelentkezhetsz játékosnak: </h2>
      {
        user && data?.games && data?.games
          .filter(game => !data.userGames.some(userGame => userGame.id === game.id)) // Exclude already displayed userGames
          .map((game, i) => (
            <Link key={i} href={`/${game.id}`} style={{ textDecoration: 'none' }}>
              <div className={'gameCard'} style={{ backgroundImage: `url(${game.coverImage})` }}>
                <h2>
                  <span className="highlightedText">{game.name}</span>
                </h2>
                <p>
                  <span className="highlightedText">{game.introduction}</span>
                </p>
              </div>
            </Link>
          ))
      }
      <br />
      <button onClick={handleSignOut}>Sign Out</button>
    </>
  )
}

export default Landing;