'use client'

import styles from './page.module.css'
import { signIn, signOut, getProviders, useSession } from 'next-auth/react'
import { useState, useEffect } from "react";
import React from 'react'
import Link from 'next/link';
import { useData } from "./context/DataContext";


function Landing() {
  const provider = null;
  const [authProviders, setAuthProviders] = useState(provider);
  const { data: session } = useSession();
  //const { data: scenes, setData: setScenes } = useData();
  const { data, setData } = useData();

  useEffect(() => {
    const setProviders = async () => {
      const response = await getProviders();
      setAuthProviders(response);
    }
    setProviders();
  }, [])

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

  if(!session) {
    return (
      <>
        <h1>Kalandjáték - csak beavatottaknak</h1>
        <p>Meghívott vagy? Próbálj belépni, és kiderül!</p>
        {
          (authProviders && Object.values(authProviders).map((provider) => (
            <button className={styles.authButton} onClick={() => handleGoogleSignIn(provider)} type='button' key={provider.name}>Sign In With {provider.name}</button>
          )))
        }
      </>
    )
  };
  if (!data) {
    return (
      <>
        <h1>Loading...</h1>
      </>
    )
  };

  const { player, scenes, game } = data;

  function handleGoogleSignIn(_provider) {
    const response = signIn(_provider.id);
  }

  function handleGoogleSignOut() {
    signOut();
  }

  return (
    <>
      <h1>{game.title}</h1>
      {
        session && (
          <h2>{game.subtitle}{player && player.character}</h2>
        )
      }
      {
        session && (
          <>
            <hr style={{ width: "30%"}}/>
            <h3>Fejezetek</h3>
            {
              !scenes && (<p>Loading...</p>)
            }
            {
              scenes && scenes.map((scene, i) => (
                <Link key={i} href={`scene/${scene.id}`}>{scene.title}</Link>
              ))
            }
          </>
        )
      }
      {
        session?.user && (
          <button className={styles.unauthButton} onClick={() => handleGoogleSignOut()} type='button'>Sign Out From Google</button>
        )
      }
    </>
  )
}

export default Landing;