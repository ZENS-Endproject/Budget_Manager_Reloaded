// services/auth.js
import { Auth } from "aws-amplify";

// Configurer Cognito
Auth.configure({
    region: "eu-central-1",
    userPoolId: "<COGNITO_USER_POOL_ID>",           // Remplace par ton ID Cognito
    userPoolWebClientId: "<COGNITO_USER_POOL_CLIENT_ID>", // Remplace par ton Client ID
});

// Fonction de login
export async function login(email, password) {
    try {
        const user = await Auth.signIn(email, password);
        return user;
    } catch (err) {
        throw err;
    }
}
