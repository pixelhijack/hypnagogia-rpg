"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "../../layout";

function AdminPage() {
  const { user } = useAuth();
  const { collectionName } = useParams();
  const [data, setData] = useState([]);
  const [textareaValue, setTextareaValue] = useState("");

  useEffect(() => {
    if (!user || !collectionName) {
      return;
    }

    user.getIdToken().then((idToken) => {
      fetch(`/api/admin/${collectionName}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      })
        .then((res) => res.json())
        .then((json) => {
          setData(json);
          setTextareaValue(JSON.stringify(json, null, 2));
        })
        .catch((error) => {
          console.error("Error fetching collection:", error);
        });
    });
  }, [user, collectionName]);

  const handleSubmit = () => {
    const isConfirmed = window.confirm("SUPER SUPER SURE???!!!.");

    if (!isConfirmed || !user || !collectionName) {
      return; // Exit if the admin cancels the action
    }

    user.getIdToken().then((idToken) => {
      fetch(`/api/admin/${collectionName}`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`,
        },
        body: textareaValue,
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.success) {
            alert("Collection updated successfully!");
          } else {
            alert("Error updating collection");
          }
        })
        .catch((error) => {
          console.error("Error updating collection:", error);
        });
    });
  };

  return (
    <div>
      <h1>Admin: {collectionName || "No Collection Selected"}</h1>
      <textarea
        value={textareaValue}
        onChange={(e) => setTextareaValue(e.target.value)}
        rows={20}
        cols={80}
      />
      <button onClick={handleSubmit}>Update Collection</button>
    </div>
  );
}

export default AdminPage;