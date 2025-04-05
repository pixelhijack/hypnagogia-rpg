'use client';

import React, { useEffect, useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../layout';
import { useParams } from 'next/navigation';
import InteractionForm from '../components/InteractionForm';

function Chapter() {
  const [ data, setData ] = useState();
  const { game } = useParams();
  const { user, handleSignIn, handleSignOut } = useAuth();
  const [selectedChapter, setSelectedChapter] = useState(null); // State for selected chapter
  const [isLeftColumnOpen, setIsLeftColumnOpen] = useState(false); // State for left column visibility
  const [interactions, setInteractions] = useState([]); 

  const fetchInteractions = () => {
    if (user) {
      user.getIdToken().then((idToken) => {
        fetch(`/api/interactions/${game}`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        })
          .then((response) => response.json())
          .then((json) => {
            console.log("CLIENT: /api/interactions response", json);
            setInteractions(json?.interactions || []);
          })
          .catch((error) => {
            console.log("ERROR: /api/interactions", error);
          });
      });
    }
  };

  useEffect(() => {
    if (user && !data?.githubData && !data?.error) {
      user.getIdToken().then((idToken) => {
        fetch(`/api/game/${game}`, {
          headers: {
            Authorization: `Bearer ${idToken}`, // Pass Firebase ID token in Authorization header
          },
        })
          .then((response) => response.json())
          .then((json) => {
            console.log("CLIENT: /api/games response", json);
            setData(json);
            // By default open on the last chapter
            if (json.githubData?.chapters?.length > 0) {
              setSelectedChapter(json.githubData.chapters[json.githubData.chapters.length - 1]); // Default to the last chapter
            }
          })
          .catch((error) => {
            console.log("ERROR: /api/games", error);
            setData({ error: "Disaster happened. Please try again later." });
          });
      });
    }
  }, [user, data]);

  useEffect(() => {
    fetchInteractions();
  }, [user, data]);

  if (!user) {
    return (
      <>
        <h1>Kalandjáték - csak beavatottaknak</h1>
        <p>Meghívott vagy? Próbálj belépni, és kiderül!</p>
        <button onClick={handleSignIn}>Sign In With Google</button>
      </>
    );
  }

  console.log("CLIENT: Chapter state", data);

  if (data?.error) {
    return (
      <>
        <h1>{data.error}</h1>
      </>
    );
  }

  if (!data?.githubData) {
    return (
      <>
        <h1>Loading...</h1>
      </>
    );
  }

  return (
    <div className="chapterWrapper">
      {/* Hamburger Icon for Mobile */}
      <button
        className="hamburgerButton"
        onClick={() => setIsLeftColumnOpen(!isLeftColumnOpen)}
      >
        { isLeftColumnOpen ? '✖' : '☰'}
      </button>

      {/* Left Column: List of Chapters */}
      <div className={`leftColumn ${isLeftColumnOpen ? 'open' : 'collapsed'}`}>
        <h2>Tartalom</h2>
        {data.githubData?.chapters.map((chapter, index) => (
          <div
            key={index}
            className={`chapterItem ${selectedChapter?.name === chapter.name ? 'selected' : ''}`}
            onClick={() => {
              setIsLeftColumnOpen(false);
              setSelectedChapter(chapter);
            }} 
          >
            {chapter.title}
          </div>
        ))}
      </div>

      {/* Right Column: Selected Chapter Content */}
      <div className="rightColumn" onClick={() => setIsLeftColumnOpen(!isLeftColumnOpen)}>
        <div dangerouslySetInnerHTML={{ __html: selectedChapter?.content }} />

        {/* Show interactions if available */}
        {interactions.map((interaction, index) => (
          <div key={index} className="interactionItem">
            <p><strong>{interaction.characterName}:</strong></p>
            <p>{interaction.text}</p>
          </div>
        ))}

        {/* Show interaction form on last chapter */}
        {data.githubData?.chapters[data.githubData?.chapters.length - 1]?.title === selectedChapter.title && (
          <div className="interactionForm">
            <InteractionForm game={game} user={user} afterSave={fetchInteractions} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Chapter;