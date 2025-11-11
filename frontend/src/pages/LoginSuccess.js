// src/pages/LoginSuccess.jsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function LoginSuccess() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");
        if (token) {
            localStorage.setItem("token", token); // backup token
            navigate("/expenses");
        } else {
            navigate("/login");
        }
    }, [location, navigate]);

    return <div>Redirecting...</div>;
}
