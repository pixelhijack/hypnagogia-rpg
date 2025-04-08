"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../layout";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import LoadingAnimation from "../../components/LoadingAnimation";

function NumberedBook() {
  const [data, setData] = useState();
  const { game, chapter } = useParams();
  const { user, handleSignIn } = useAuth();
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [isLeftColumnOpen, setIsLeftColumnOpen] = useState(false);

  const BOOK_CACHE = `gameData:${game}`; // Cache key based on the game title
  const CHAPTER_NO_CACHE = `chapterNo:${game}`; // Cache key for chapter number

  localStorage.setItem(CHAPTER_NO_CACHE, chapter); // Store the chapter number in local storage

  useEffect(() => {
    if (user && !data?.githubData && !data?.error) {
      // Check if data is already cached
      const cachedData = localStorage.getItem(BOOK_CACHE);
      if (cachedData) {
        console.log("Using cached game data");
        const cachedGithubData = JSON.parse(cachedData);
        setData({ githubData: cachedGithubData });
        setSelectedChapter(cachedGithubData.chapters[chapter]);
        return;
      }

      // Fetch game data from the server to override the cache
      user.getIdToken().then((idToken) => {
        fetch(`/api/game/${game}`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        })
          .then((response) => response.json())
          .then((json) => {
            console.log("CLIENT: /api/games response", json);
            setData(json);
            if (json.githubData?.chapters?.length > 0) {
              localStorage.setItem(BOOK_CACHE, JSON.stringify(json.githubData)); // Cache the data
              setSelectedChapter(json.githubData.chapters[chapter]);
            }
          })
          .catch((error) => {
            console.log("ERROR: /api/games", error);
            setData({ error: "Disaster happened. Please try again later." });
          });
      });
    }
  }, [user]);

  // Inline component to process and render chapter content
  const ChapterContent = ({ content }) => {
    if (!content) return null;

    // Split the content by <a> tags and process links
    const parts = [];
    const regex = /<a href="([^"]+)">([^<]+)<\/a>/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      // Add the text before the link
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: content.slice(lastIndex, match.index),
        });
      }

      // Add the link
      parts.push({
        type: "link",
        href: match[1],
        text: match[2],
      });

      lastIndex = regex.lastIndex;
    }

    // Add the remaining text after the last link
    if (lastIndex < content.length) {
      parts.push({
        type: "text",
        content: content.slice(lastIndex),
      });
    }

    // Render the parts
    return (
      <div>
        {parts.map((part, index) => {
          if (part.type === "text") {
            return (
              <span
                key={index}
                dangerouslySetInnerHTML={{ __html: part.content }}
              />
            );
          } else if (part.type === "link") {
            return (
              <Link key={index} href={part.href}>
                {part.text}
              </Link>
            );
          }
        })}
      </div>
    );
  };

  if (!user) {
    return (
      <>
        <h1>Kalandjáték - csak beavatottaknak</h1>
        <p>Meghívott vagy? Próbálj belépni, és kiderül!</p>
        <button onClick={handleSignIn}>Sign In With Google</button>
      </>
    );
  }

  if (data?.error) {
    return (
      <>
        <h1>{data.error}</h1>
      </>
    );
  }

  if (!data?.githubData) {
    return (
      <h1>
        <LoadingAnimation />
      </h1>
    );
  }

  return (
    <div className={`chapterWrapper public`}>
      <button
        className="hamburgerButton"
        onClick={() => setIsLeftColumnOpen(!isLeftColumnOpen)}
      >
        {isLeftColumnOpen ? "✖" : "☰"}
      </button>

      {/* data?.currentGame?.type !== 'singleplayer' && (
        <div className={`leftColumn ${isLeftColumnOpen ? "open" : "collapsed"}`}>
          <h2>Tartalom</h2>
          {data.githubData?.chapters.map((chapter, index) => (
            <div
              key={index}
              className={`chapterItem ${
                selectedChapter?.name === chapter.name ? "selected" : ""
              }`}
              onClick={() => {
                setIsLeftColumnOpen(false);
                setSelectedChapter(chapter);
              }}
            >
              {chapter.title}
            </div>
          ))}
        </div>
      ) */}

      <div className="rightColumn">
        <h1>{selectedChapter?.title}</h1>
        <ChapterContent content={selectedChapter?.content} />
      </div>
    </div>
  );
}

export default NumberedBook;