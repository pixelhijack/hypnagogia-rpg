'use client'

import styles from './page.module.css';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useData } from './context/DataContext';
import { useAuth } from './layout';
import LoadingAnimation from './components/LoadingAnimation';


function Landing() {
  const [data, setData]  = useState();
  const { user, handleSignIn, handleSignOut } = useAuth();
  const [joiningGameIds, setJoiningGameIds] = useState([]); // Track games the user has joined

  const fetchGames = async (headers) => {
    fetch("/api/games", {
      headers
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
  };

  useEffect(() => {
    if (user && !data && !data?.error) {
      user.getIdToken().then((idToken) => {
        fetchGames({ Authorization: `Bearer ${idToken}` });
      });
    }
    if (!user && !data && !data?.error) {
      fetchGames({});
    }
  }, [user, data]);

  // Reset `data` when `user` changes
  useEffect(() => {
    setData(null); // Clear data to force re-fetch and refresh the view
  }, [user]);

  const handleJoinGame = async (gameId) => {
    if (!user) {
      alert("Please sign in to join the game.");
      return;
    }

    try {
      const idToken = await user.getIdToken();
      const response = await fetch("/api/joining", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ gameId }),
      });

      if (response.ok) {
        setJoiningGameIds((prev) => [...prev, gameId]); // Add the game ID to the joined list
      } else {
        const errorData = await response.json();
        console.error("Error joining game:", errorData.error);
        alert("Failed to join the game. Please try again.");
      }
    } catch (error) {
      console.error("Error in handleJoinGame:", error);
      alert("An error occurred. Please try again.");
    }
  };

  console.log("CLIENT: Landing state", data);

  if(!user) {
    return (
      <>
        <h1>Kalandjáték - csak beavatottaknak</h1>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h3>Mi ez az oldal?</h3>
          <p>
            Emlékszel még azokra a régi könyvekre, amikben a történet folytatásához lapozni kellett?
            Esetleg a mesélős játékokra, amit a Stranger Thingsben játszottak?
            Teleportálj vissza a gyerekkorodba, és fedezd fel ugyanezt online is!
          </p>
          <h3>Játékos vagy már?</h3>
            <p>
              Ha már játszol, akkor csak jelentkezz be, és folytasd a történetet!
              <br />
              Ha még nem játszottál, nézz körül, és csatlakozz egy közeljövőben induló kalandhoz bejelentkezés után!
              <br /><br />
            </p>
        </div>
        <button onClick={handleSignIn}>Belépés Google fiókkal</button>
        {data?.games && (<h2>Elérhető történetek:</h2>)}
        {data?.games?.map((game, i) => (
          <div key={i} className={'gameCard'} style={{ backgroundImage: `url(${game.coverImage})` }}>
            <h2>
              <span className="highlightedText">{game.name}</span>
            </h2>
            <p>
              <span className="highlightedText">{game.introduction}</span>
            </p>
          </div>
        ))}
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
      <h1>
        <LoadingAnimation />
      </h1>
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
                <br/>
                <button style={{ margin: '10px 0 0 0', float: 'right', border: '1px solid grey'}}>Folytatás →</button>
              </p>
            </div>
          </Link>
        ))
      }
      <h2>Más történetek, amikre jelentkezhetsz játékosnak: </h2>
      {
        user && data?.games && data.userGames && data?.games
          .filter(game => !data.userGames.some(userGame => userGame.id === game.id)) // Exclude already displayed userGames
          .map((game, i) => (
            <div key={i} className={'gameCard'} style={{ backgroundImage: `url(${game.coverImage})` }}>
              <h2>
                <span className="highlightedText">{game.name}</span>
              </h2>
              <p>
                <span className="highlightedText">{game.introduction}</span>
                <br/>
                <button
                  onClick={() => handleJoinGame(game.id)}
                  style={{
                    margin: '10px 0 0 0',
                    float: 'right',
                    border: '1px solid grey',
                  }}
                  disabled={joiningGameIds.includes(game.id)} // Disable button if already joined
                >
                  {joiningGameIds.includes(game.id)
                    ? "Jelentkezésed megkaptuk, nézz vissza később!"
                    : "Jelentkezés →"}
                </button>
              </p>
            </div>
          ))
      }
      <br />
      <button onClick={handleSignOut}>Kilépés Google fiókból</button>
    </>
  )
}

export default Landing;