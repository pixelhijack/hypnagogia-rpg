'use client';
import { useState, useEffect } from "react";
import { useData } from "../../context/DataContext";

export default function RequestedFromApi({ params }) {
    const { data: scenes, setData: setScenes } = useData();

    console.log('============');
    console.log('/fromapi/[id]/page.js', params)
    console.log('CLIENT: data provider, sub page', scenes);
    console.log('============');
    
    
    useEffect(() => {
        // if we got here from landing page, there is already data by the data provider
        // however if opened this subpage directly, data provider cannot provide data from a prev page
        // therefore we need to fetch it
        if(!scenes) {
            fetch("/api/scenes")
                .then(response => response.json())
                .then(setScenes)
                .catch(error => {
                console.log('ERROR: /api/scenes', error);
                });
        }
      }, [scenes]);
    

    return !scenes ? (
        <p>Loading...</p>
    ) : (
        <>
            <p>This is a dynamically routed page requesting local api: {params.id}</p>
        </>
    )
}