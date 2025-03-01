'use client';
import { useState, useEffect } from "react";

export default function RequestedFromApi({ params }) {
    console.log('============');
    console.log('/fromapi/[id]/page.js', params)
    console.log('============');

    useEffect(() => {
        fetch("/api/scenes")
            .then(response => response.json())
            .then(json => console.log(json))
            .catch(error => {
              console.log('ERROR: /api/scenes', error);
            });
      }, []);

    return (
        <>
            <p>This is a dynamically routed page requesting local api: {params.id}</p>
        </>
    )
}