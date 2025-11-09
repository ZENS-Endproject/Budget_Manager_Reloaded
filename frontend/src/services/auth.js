// services/auth.js
import { Amplify, Auth } from "aws-amplify";

// Configurer Amplify (et pas Auth directement)
Amplify.configure({
    Auth: {
        region: "eu-central-1",
        userPoolId: "eu-central-1_e4POt9DqQ",
        userPoolWebClientId: "163gnc5eh09v3ukktfatlfbr9c",
    },
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
