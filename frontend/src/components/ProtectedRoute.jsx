// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { API_URL } from "../lib/utils";
export default function ProtectedRoute({ children }) {
    const [loading, setLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch(`${API_URL}/session-check`, {
                    credentials: "include",
                });
                if (!res.ok) throw new Error("Session check failed");
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
