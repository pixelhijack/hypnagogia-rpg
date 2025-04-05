'use client';

import React, { useState } from 'react';

function InteractionForm({ user, game, afterSave, chapter }) {
  const [text, setText] = useState('');
  const [feedback, setFeedback] = useState(null); // Feedback message

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim()) {
      setFeedback('Üres üzenetet nem küldhetsz el!'); 
      return;
    }

    try {
      const idToken = await user.getIdToken(); 
      const response = await fetch(`/api/game/${game}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`, // Pass Firebase ID token in Authorization header
        },
        body: JSON.stringify({ 
          text: text.trim(),
          chapter
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add interaction');
      }

      setFeedback('Postagalambod elrepült!'); 
      setText(''); // Clear the textarea

      // After saving, we want to refresh the interactions
      if (afterSave) {
        setFeedback(''); 
        afterSave();
      }

    } catch (error) {
      console.error('Error adding interaction:', error);
      setFeedback('Postagalambod eltévedt. Kérjük, próbálkozz később újra.');
    }
  };

  return (
    <div>
      <h2>Mit teszel?</h2>
      <small>{feedback && <p style={{ color: 'darkred' }}>{feedback}</p>}</small>
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Mit mond / tesz a karaktered? Írhatsz a mesélőnek is, így: @dm..., ekkor az üzeneted nem jelenik meg nyilvánosan"
          rows="5"
          style={{ width: '100%', marginBottom: '10px' }}
        />
        <button type="submit" style={{ padding: '10px 20px' }}>
          Küldés
        </button>
      </form>
    </div>
  );
}

export default InteractionForm;