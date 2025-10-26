const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER, // Dein PostgreSQL-Benutzername
  host: process.env.DB_HOST, // z. B. 'localhost'
  database: process.env.DB_NAME, // Name deiner Datenbank
  password: process.env.DB_PASSWORD, // Dein Passwort
  port: process.env.DB_PORT, // Standardport für PostgreSQL
});

module.exports = pool;

async function hashPasswords() {
  const { rows } = await pool.query("SELECT id, password FROM users");

  for (let user of rows) {
    if (!user.password.startsWith("$2")) {
      // $2a or $2b => hashed
      const hash = await bcrypt.hash(user.password, 10);
      await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
        hash,
        user.id,
      ]);
      console.log(`Password hashed for user ${user.id}`);
    }
  }

  console.log("Done!");
  process.exit();
}

hashPasswords();
