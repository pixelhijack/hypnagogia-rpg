'use client';

import React, { useEffect, useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../layout';
import { useParams } from 'next/navigation';

function Chapter() {
  const { data: data, setData } = useData();
  const { game } = useParams();
  const { user, handleSignIn, handleSignOut } = useAuth();
  const [selectedChapter, setSelectedChapter] = useState(null); // State for selected chapter
  const [isLeftColumnOpen, setIsLeftColumnOpen] = useState(false); // State for left column visibility

  useEffect(() => {
    if (user && !data?.githubData) {
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
            if (json.githubData?.chapters?.length > 0) {
              setSelectedChapter(json.githubData.chapters[0]); // Default to the first chapter
            }
          })
          .catch((error) => {
            console.log("ERROR: /api/games", error);
          });
      });
    }
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
        <h2>Chapters</h2>
        {data.githubData?.chapters.map((chapter, index) => (
          <div
            key={index}
            className={`chapterItem ${selectedChapter?.name === chapter.name ? 'selected' : ''}`}
            onClick={() => {
              setIsLeftColumnOpen(false);
              setSelectedChapter(chapter);
            }} 
          >
            {chapter.name}
          </div>
        ))}
      </div>

      {/* Right Column: Selected Chapter Content */}
      <div className="rightColumn" onClick={() => setIsLeftColumnOpen(!isLeftColumnOpen)}>
        <p dangerouslySetInnerHTML={{ __html: selectedChapter?.content }} />
      </div>
    </div>
  );
}

export default Chapter;