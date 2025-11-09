// services/api.js
import { getJwtToken } from "./auth";

export async function fetchProtectedData() {
    const token = await getJwtToken();

    const res = await fetch("/api/protected", {
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch protected data");
    }

    const data = await res.json();
    return data;
}
