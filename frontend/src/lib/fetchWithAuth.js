import { API_URL } from "../lib/utils";

async function getValidToken() {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) return null;

    const response = await fetch(`${API_URL}/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
        credentials: "include",
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

export async function fetchWithAuth(url, options = {}) {
    let token = localStorage.getItem("access_token");

    options.headers = {
        ...(options.headers || {}),
        "Authorization": `Bearer ${token}`
    };

    options.credentials = "include";

    let response = await fetch(url, options);


    if (response.status === 401 || response.status === 403) {
        const newToken = await getValidToken();
        if (!newToken) throw new Error("Session expired");

        options.headers["Authorization"] = `Bearer ${newToken}`;
        response = await fetch(url, options);
    }

    return response;
}
