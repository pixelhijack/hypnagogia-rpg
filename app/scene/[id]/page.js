'use client';
import { useState, useEffect } from "react";
import { useSession } from 'next-auth/react'
import { useData } from "../../context/DataContext";
import Link from 'next/link';
import MarkdownRenderer from 'react-markdown-renderer';

export default function RequestedFromApi({ params }) {
    const { data: session } = useSession();
    const { data, setData } = useData();
    const [message, setMessage] = useState("");

    const getScenes = () => {
        fetch("/api/scenes")
            .then(response => response.json())
            .then(json => {
                setData(json);
            })
            .catch(error => {
                console.log('ERROR: /api/scenes', error);
            });
    }
    
    useEffect(() => {
        // if we got here from landing page, there is already data by the data provider
        // however if opened this subpage directly, data provider cannot provide data from a prev page
        // therefore we need to fetch it
        if(!data) {
            getScenes();
        }
    }, [data, setData]);

    const sendMessage = async (sceneId) => {
        await fetch(`/api/scenes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sceneId, content: message })
        });
        setMessage("");
        getScenes();
      };

    if (!data) return <p>Loading...</p>;

    const { player, scenes } = data;
    const scene = scenes && scenes.find(sc => sc.id === params.id);

    console.log('============');
    console.log('/fromapi/[id]/page.js', params)
    console.log('CLIENT: data provider, sub page', scenes, scene);
    console.log('============');
    
    return (
        <>
            {!session && <Link href={`/`}>Menj a kezdőoldalra és lépj be</Link>}
            {scenes && <h2>Fejezet: {scene.title}</h2>}
            {scene && scene.messages.map((message, i) => (
                <div key={i}>
                    <MarkdownRenderer markdown={message.content} />
                </div>
            ))}

            <input placeholder={`A karaktered ezt teszi / mondja...`} value={message} onChange={e => setMessage(e.target.value)} />
            <button onClick={() => sendMessage(scene.id)}>Hozzászólás</button>
        </>
    );
}