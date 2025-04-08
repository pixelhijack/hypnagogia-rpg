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
          <blockquote style={{ fontSize: '1.2em', fontStyle: 'italic', marginBottom: '20px' }}>
            "Na ide figyelj, a te könyveid...biztonságosak."
          </blockquote>
          <h3>Mi ez az oldal?</h3>
          <p>
            Emlékszel még azokra a régi könyvekre, amikben a történet folytatásához lapozni kellett?
            Esetleg a mesélős játékokra, amit az E.T. elején vagy a Stranger Thingsben játszottak?
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
        user && data && data.userGames && data.userGames
          .filter(game => data.userGames.some(userGame => userGame.id === game.id))
          .filter(game => game.type !== 'singleplayer')
          .map((game, i) => (
            <Link key={i} href={`/${game.id}`} style={{ textDecoration: 'none' }}>
              <div className={'gameCard'} style={{ backgroundImage: `url(${game.coverImage})` }}>
                <h2>
                  <span className="highlightedText">{game.name}</span>
                </h2>
                <p>
                  <span className="highlightedText">{game.introduction}</span>
                  <br/>
                  <button>Folytatás →</button>
                </p>
              </div>
            </Link>
          ))
      }
      <h2>Más történetek, amikre jelentkezhetsz játékosnak: </h2>
      {
        user && data?.games && data.userGames && data?.games
          .filter(game => !data.userGames.some(userGame => userGame.id === game.id)) // Exclude already displayed userGames
          .filter(game => game.type !== 'singleplayer')
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
      <h2>Egyedül is játszható, klasszikus lapozgatós könyvek: </h2>
      {
        user && data?.games && data.userGames && data?.games
          .filter(game => game.type === 'singleplayer')
          .map((game, i) => {
            const cachedChapter = localStorage.getItem(`chapterNo:${game.id}`);
            const gameChapter = cachedChapter ? `/${game.id}/${JSON.parse(cachedChapter)}` : `/${game.id}/0`;
            return (
              <Link key={i} href={gameChapter} style={{ textDecoration: 'none' }}>
                <div className={'gameCard'} style={{ backgroundImage: `url(${game.coverImage})` }}>
                  <h2>
                    <span className="highlightedText">{game.name}</span>
                  </h2>
                  <p>
                    <span className="highlightedText">{game.introduction}</span>
                    <br/><br/>
                  <button>
                    {cachedChapter ? "Folytasd ahol abbahagytad →" : "Játék kezdése →"}
                  </button>
                  </p>
                </div>
              </Link>
            )})
      }
      <br />
      <button onClick={() => {
        handleSignOut();
        // Clear all cache keys starting with "gameData:"
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("gameData:")) {
            localStorage.removeItem(key);
          }
        });
      }}>Kilépés Google fiókból</button>
    </>
  )
}

export default Landing;