// src/pages/LoginSuccess.jsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function LoginSuccess() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        console.log(params);
        const token = params.get("token");
        const user = params.get("user");
        if (token) {
            localStorage.setItem("token", token);
            localStorage.setItem("user", user);
            navigate("/expenses");
        } else {
            navigate("/login");
        }
    }, [location, navigate]);

    return <div>Redirecting...</div>;
}