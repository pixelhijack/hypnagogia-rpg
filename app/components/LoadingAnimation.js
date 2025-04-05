'use client';

import React, { useEffect, useState } from 'react';
import styles from './LoadingAnimation.module.css'; 

const randomCharacters = 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍｦｲｸｺｿﾁﾄﾉﾌﾔﾖﾙﾚﾝ:・."=*+-<>¦｜ﾘ';

function LoadingAnimation() {
  const [displayText, setDisplayText] = useState(['L', 'o', 'a', 'd', 'i', 'n', 'g', '.', '.', '.']);
  const [finalText] = useState('Loading...');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayText((prev) =>
        prev.map((char, index) =>
          index <= currentIndex
            ? finalText[index] // Stop shuffling for letters that have settled
            : randomCharacters[Math.floor(Math.random() * randomCharacters.length)] // Shuffle random characters
        )
      );

      if (currentIndex < finalText.length - 1) {
        setCurrentIndex((prev) => prev + 1); // Move to the next letter
      } else {
        // Reset the animation by restarting from the first letter
        setCurrentIndex(0);
      }
    }, 100); // Adjust speed of shuffling here

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [currentIndex, finalText]);

  return (
    <div
      className={styles.glitch}
      data-text={finalText}  
      style={{ fontFamily: 'monospace', letterSpacing: '2px' }}
    >
      {displayText.map((char, index) => (
        <span key={index}>{char}</span>
      ))}
    </div>
  );
}

export default LoadingAnimation;