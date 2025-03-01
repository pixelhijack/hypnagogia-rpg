'use client'

import styles from './page.module.css'
import { signIn, signOut, getProviders, useSession } from 'next-auth/react'
import { useState, useEffect } from "react";
import React from 'react'
import Link from 'next/link';

function page() {
  const provider = null;
  const [authProviders, setAuthProviders] = useState(provider);
  const [scenes, setScenes] = useState(provider);

  const { data: session } = useSession();
  const profileImage = session?.user?.image;

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
    if (session) {
      fetch("/api/scenes")
        .then(response => response.json())
        .then(json => {
          console.log('CLIENT: /api/scenes response', json);
          setScenes(json);
        })
        .catch(error => {
          console.log('ERROR: /api/scenes', error);
        });
    }
  }, [session]);

  return (
    <>
      {
        session != null ? (
          <h1>Welcome {session?.user?.name} !</h1>
        ) : (<h1>Are you invited to this party? Try and see</h1>)
      }
      {
        session && scenes && scenes.map(scene => (
          <Link key={scene.id} href={`scene/${scene.id}`}>{scene.title}</Link>
        ))
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