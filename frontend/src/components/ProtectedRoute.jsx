// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const [loading, setLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch("http://localhost:5005/session-check", {
                    credentials: "include",
                });
                const data = await res.json();
                setLoggedIn(data.loggedIn);
            } catch (err) {
                console.error(err);
                setLoggedIn(false);
            } finally {
                setLoading(false);
            }
        };
        checkSession();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (!loggedIn) return <Navigate to="/login" replace />;

    return children;
}
