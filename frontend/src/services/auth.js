// services/auth.js
import Auth from "@aws-amplify/auth";

// Configurer Cognito
Auth.configure({
    region: "eu-central-1",
    userPoolId: "eu-central-1_e4POt9DqQ",
    userPoolWebClientId: "163gnc5eh09v3ukktfatlfbr9c", // Remplace par ton Client ID
});

// Login avec email + password
export async function login(email, password) {
    try {
        const user = await Auth.signIn(email, password);
        return user;
    } catch (err) {
        throw err;
    }
}

// Récupérer le JWT ID Token
export async function getJwtToken() {
    const session = await Auth.currentSession();
    return session.getIdToken().getJwtToken();
}
