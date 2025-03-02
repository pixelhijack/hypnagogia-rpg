'use client'

import styles from './page.module.css'
import { signIn, signOut, getProviders, useSession } from 'next-auth/react'
import { useState, useEffect } from "react";
import React from 'react'
import Link from 'next/link';
import { useData } from "./context/DataContext";


function page() {
  const provider = null;
  const [authProviders, setAuthProviders] = useState(provider);
  const { data: session } = useSession();

  const [player, setPlayer] = useState();
  const { data: scenes, setData: setScenes } = useData();

  useEffect(() => {
    const setProviders = async () => {
      const response = await getProviders();
      setAuthProviders(response);
    }
    setProviders();
  }, [])

  function handleGoogleSignIn(_provider) {
    const response = signIn(_provider.id);
  }

  function handleGoogleSignOut() {
    signOut();
  }

  useEffect(() => {
    if (session && !scenes) {
      fetch("/api/scenes")
        .then(response => response.json())
        .then(json => {
          console.log('CLIENT: /api/scenes response', json);
          setScenes(json.scenes);
          setPlayer(json.player);
        })
        .catch(error => {
          console.log('ERROR: /api/scenes', error);
        });
    }
  }, [session, scenes, setScenes]);

  console.log('CLIENT: data provider, landing page', scenes);
  return (
    <>
      {
        session && (
          <h1>Welcome {player && player.character} !</h1>
        )
      }
      {
        !session && (<h1>Are you invited to this party? Try and see</h1>)
      }
      {
        session && (
          <>
            <hr style={{ width: "30%"}}/>
            <h2>Chapters</h2>
          </>
        )
      }
      {
        session && scenes && scenes.map(scene => (
          <Link key={scene.id} href={`scene/${scene.id}`}>{scene.title}</Link>
        ))
      }
      {
        session && !scenes && (<p>Loading...</p>)
      }
      {
        session?.user ? (
          <button className={styles.unauthButton} onClick={() => handleGoogleSignOut()} type='button'>Sign Out From Google</button>
        ) :
          (authProviders && Object.values(authProviders).map((provider) => (
            <button className={styles.authButton} onClick={() => handleGoogleSignIn(provider)} type='button' key={provider.name}>Sign In With {provider.name}</button>
          )))
      }
    </>
  )
}

export default page