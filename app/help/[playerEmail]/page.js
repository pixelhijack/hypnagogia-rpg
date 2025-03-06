'use client';
import { useState, useEffect } from "react";
import { useSession } from 'next-auth/react'
import { useData } from "../../context/DataContext";
import Link from 'next/link';

export default function RequestedFromApi({ params }) {
    const { data: session } = useSession();
    /*
        data: {
            player: {},
            scenes: [{
                id: 1,
                title: '...',
                startDate: '...',
                endDate: '...',
                content: '...',
                messages: [{
                    character: '...',
                    content: '...'
                }]
            }]
        }
    */
    const [ data, setData ] = useState();

    const getScenes = () => {
        fetch(`/api/help/${params.playerEmail}`)
            .then(response => response.json())
            .then(json => {
                setData(json);
            })
            .catch(error => {
                console.log(`ERROR /api/help/${params.plyerEmail}`, error);
            });
    }
    
    useEffect(() => {
        if(!data) {
            getScenes();
        }
    }, [data, setData]);

    if (!data) return <p>Loading...</p>;

    const { scenes } = data;

    console.log('============');
    console.log('/help/[playerEmail]/page.js', params, scenes);
    console.log('============');
    return (
        <>
            {!session && <Link href={`/`}>Menj a kezdőoldalra és lépj be</Link>}
            {scenes && <h2>POV: {params.plyerEmail}</h2>}
            
            {scenes && scenes.map((scene, i) => <div key={i} dangerouslySetInnerHTML={{ __html: scene.content }} /> )}
            
        </>
    );
}