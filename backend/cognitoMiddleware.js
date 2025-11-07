// cognitoMiddleware.js
const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

// Remplace <USER_POOL_ID> par l'ID de ton User Pool Cognito
const client = jwksClient({
    jwksUri: "https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_e4POt9DqQ/.well-known/jwks.json"
});

// Récupère la clé publique correspondant au token
function getKey(header, callback) {
    client.getSigningKey(header.kid, function (err, key) {
        if (err) return callback(err);
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
    });
}

// Middleware pour protéger les routes
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: "Token missing" });

    const token = authHeader.split(' ')[1]; // "Bearer <token>"

    jwt.verify(token, getKey, {}, (err, decoded) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user = decoded; // contient les infos Cognito (email, sub, etc.)
        next();
    });
}

module.exports = { authenticateToken };
