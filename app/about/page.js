'use client';
import { useState, useEffect } from "react";
import { useData } from "../context/DataContext";
import Link from 'next/link';

export default function About() {
    const { data, setData } = useData();
    const [user, setUser] = useState(null);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser); // Set the authenticated user
      });

      return () => unsubscribe(); // Cleanup the listener on unmount
    }, []);

    const handleSignIn = async () => {
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        console.log("User signed in:", result.user);
      } catch (error) {
        console.error("Error signing in:", error);
      }
    };

    const handleSignOut = async () => {
      try {
        await signOut(auth);
        console.log("User signed out");
      } catch (error) {
        console.error("Error signing out:", error);
      }
    };
    
    useEffect(() => {
        if (user && !data) {
          fetch("/api/scenes")
            .then(response => response.json())
            .then(json => {
              console.log('CLIENT: /api/scenes response', json);
              setData(json);
            })
            .catch(error => {
              console.log('ERROR: /api/scenes', error);
            });
        }
      }, [session, data, setData]);

    if (!data) return <p>Loading...</p>;

    const { game } = data;

    console.log('============');
    console.log('/about.js', game);
    console.log('============');
    return (
        <>
            {!session && <Link href={`/`}>Menj a kezdőoldalra és lépj be</Link>}
            {game && <h2>About</h2>}
            {game && <div dangerouslySetInnerHTML={{ __html: game.about }} />}
        </>
    );
}