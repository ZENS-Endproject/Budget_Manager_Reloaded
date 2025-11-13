import { API_URL } from "../lib/utils";


async function getValidToken() {
    let token = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");

    if (!token) return null;


    const response = await fetch(`${API_URL}/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
        console.error("Could not refresh token");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        return null;
    }

    const data = await response.json();
    localStorage.setItem("access_token", data.access_token);
    return data.access_token;
}

// Wrapper fetch
export async function fetchWithAuth(url, options = {}) {
    let token = localStorage.getItem("access_token");

    if (!options.headers) options.headers = {};
    options.headers["Authorization"] = `Bearer ${token}`;

    let response = await fetch(url, options);

    if (response.status === 403) {
        token = await getValidToken();
        if (!token) throw new Error("Session expired");

        options.headers["Authorization"] = `Bearer ${token}`;
        response = await fetch(url, options);
    }

    return response;
}
