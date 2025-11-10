import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginSuccess() {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (token) {
            localStorage.setItem("token", token);
            // Tu peux aussi stocker userInfo si tu l'envoies depuis backend
            navigate("/expenses"); // redirige vers la page principale après login
        } else {
            navigate("/login"); // pas de token → retour au login
        }
    }, [navigate]);

    return <p>Loading...</p>;
}
