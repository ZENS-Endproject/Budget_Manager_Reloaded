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
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        const id_token = params.get("id_token");
        const user = params.get("user");
        if (access_token && refresh_token) {
            localStorage.setItem("access_token", access_token);
            localStorage.setItem("refresh_token", refresh_token);
            localStorage.setItem("id_token", id_token);
            localStorage.setItem("user", user);
            navigate("/expenses");
        } else {
            navigate("/login");
        }
    }, [location, navigate]);

    return <div>Redirecting...</div>;
}