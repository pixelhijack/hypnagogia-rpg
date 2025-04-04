'use client';

import React, { useEffect, useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../layout';
import { useParams } from 'next/navigation';

function Chapter() {
  const { data: data, setData } = useData();
  const { game, chapter } = useParams();
  const { user, handleSignIn, handleSignOut } = useAuth();
  const [selectedChapter, setSelectedChapter] = useState(null); // State for selected chapter

  useEffect(() => {
    if (user && !data) {
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

  if (!data) {
    return (
      <>
        <h1>Loading...</h1>
      </>
    );
  }

  return (
    <div className="chapterWrapper">
      {/* Left Column: List of Chapters */}
      <div className="leftColumn">
        <h2>Fejezet</h2>
        {data.githubData?.chapters.map((chapter, index) => (
          <div
            key={index}
            className={`chapterItem ${selectedChapter?.name === chapter.name ? 'selected' : ''}`}
            onClick={() => setSelectedChapter(chapter)} // Set the selected chapter
          >
            {chapter.name}
          </div>
        ))}
      </div>

      {/* Right Column: Selected Chapter Content */}
      <div className="rightColumn">
        <h2>{selectedChapter?.name || 'Select a Chapter'}</h2>
        <p>{selectedChapter?.content || 'No content available'}</p>
      </div>
    </div>
  );
}

export default Chapter;