"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ModeToggle() {
    const { theme, setTheme } = useTheme();

    console.log("Current theme:", theme);  // Pour voir la valeur dans la console

    if (!theme) return null; // Attend que le thème soit chargé

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        console.log("Switching theme to:", newTheme);
        setTheme(newTheme);
    };

    return (
        <button
            onClick={toggleTheme}
            style={{ padding: 8, border: "none", background: "transparent", cursor: "pointer" }}
            aria-label="Toggle theme"
        >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
}
