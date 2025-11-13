require("dotenv").config();
const express = require("express");

const cors = require("cors");

const jwt = require("jsonwebtoken");
const { Pool } = require("pg");


const app = express();
const PORT = process.env.PORT || 5005;
app.set("trust proxy", 1);

const pool = new Pool({
    user: process.env.DB_USER,
    host: "localhost", // <-- ici tu avais oublié les guillemets
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,

});

const createTable = async () => {
    const client = await pool.connect();
    try {
        const queryText = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        password VARCHAR(255) NOT NULL,
        budget REAL NOT NULL,
        e_mail VARCHAR(100) NOT NULL
      );
    `;
        await client.query(queryText);
        console.log("✅ Table 'users' exists / created!");
    } catch (err) {
        console.error("❌ Error creating table:", err);
    } finally {
        client.release();
    }
};

createTable();

// Middleware
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(express.static("public"));

// ⚙️ Pour utiliser await ici, il faut le mettre dans une fonction
(async () => {
    try {
        const result_cognito_id = await pool.query(
            "SELECT users.cognito_id FROM public.users WHERE users.id = 1"
        );
        console.log("resultat est: ", result_cognito_id);
    } catch (err) {
        console.error("Erreur DB:", err);
    }
})();

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
