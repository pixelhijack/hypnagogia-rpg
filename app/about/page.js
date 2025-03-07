'use client';
import { useState, useEffect } from "react";
import { useSession } from 'next-auth/react'
import { useData } from "../context/DataContext";
import Link from 'next/link';

export default function About() {
    const { data: session } = useSession();
    const { data, setData } = useData();
    
    useEffect(() => {
        if (session && !data) {
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