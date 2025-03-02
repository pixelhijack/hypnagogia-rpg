'use client';
import { useState, useEffect } from "react";
import { useSession } from 'next-auth/react'
import { useData } from "../../context/DataContext";
import Link from 'next/link';
import MarkdownRenderer from 'react-markdown-renderer';

export default function RequestedFromApi({ params }) {
    const { data: session } = useSession();
    const { data, setData } = useData();
    
    useEffect(() => {
        // if we got here from landing page, there is already data by the data provider
        // however if opened this subpage directly, data provider cannot provide data from a prev page
        // therefore we need to fetch it
        if(!data) {
            fetch("/api/scenes")
                .then(response => response.json())
                .then(json => {
                    setData(json);
                })
                .catch(error => {
                    console.log('ERROR: /api/scenes', error);
                });
        }
    }, [data, setData]);

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
        </>
    );
}