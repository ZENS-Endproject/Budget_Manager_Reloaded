const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { refreshToken } = require("./tokenController");
const PDFDocument = require("pdfkit");

const app = express();
const PORT = 5005;

//middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }

    req.user = user;
    next();
  });
}

app.post("/refresh-token", refreshToken);

const pool = new Pool({
  user: process.env.DB_USER, // Dein PostgreSQL-Benutzername
  host: process.env.DB_HOST, // z. B. 'localhost'
  database: process.env.DB_NAME, // Name deiner Datenbank
  password: process.env.DB_PASSWORD, // Dein Passwort
  port: process.env.DB_PORT, // Standardport für PostgreSQL
  ssl: {
    rejectUnauthorized: false
  }	
});

const createTable = async () => {
  const client = await pool.connect();
  try {
    const queryText = `
            CREATE TABLE IF NOT EXISTS Users (id  SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    budget real NOT NULL,
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

app.use(cors());
app.use(express.json()); // Ermöglicht Express Json aus einem Body auszulesen
app.use(express.static("public"));

app.get("/expenses/:user_id", authenticateToken, async (req, res) => {
  const { user_id } = req.params;
  try {
    const result = await pool.query(
      "SELECT expenses.id, expenses.user_id, expenses.amount, expenses.name, expenses.category_id, expenses.date, categories.category FROM public.expenses JOIN public.categories on expenses.category_id = categories.id WHERE expenses.user_id = $1 ORDER BY expenses.date DESC",
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error while fetching the Expenses:", err);
    res.status(500).json({ error: "Internal  Server Error" });
  }
});

app.get("/expenses/:user_id/search", authenticateToken, async (req, res) => {
  const { user_id } = req.params;
  const { monthYear } = req.query;

  // zum Beispiel
  // localhost:5005/expenses/1/search?monthYear=2025-05
  try {
    let query = `
      SELECT expenses.id, expenses.user_id, expenses.amount, expenses.name,
             expenses.category_id, expenses.date, categories.category
      FROM public.expenses
      JOIN public.categories ON expenses.category_id = categories.id
      WHERE expenses.user_id = $1
    `;
    const values = [user_id];
    if (monthYear) {
      const [year, month] = monthYear.split("-").map(Number);
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0);

      const isoStart = monthStart.toISOString().split("T")[0]; // YYYY-MM-DD
      const isoEnd = monthEnd.toISOString().split("T")[0]; // YYYY-MM-DD

      query += ` AND expenses.date BETWEEN $2 AND $3`;
      values.push(isoStart, isoEnd);
    }

    query += " ORDER BY expenses.date DESC";

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("Error while fetching the Expenses:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/expenses", authenticateToken, async (req, res) => {
  const { user_id, category_id, amount, name, date } = req.body;

  if (!user_id || !category_id || !amount || !name || !date) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO "expenses" (user_id, category_id, amount, name, date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user_id, category_id, amount, name, date]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error while fetching the Expenses:", err);
    res.status(500).json({ error: "Internal  Server Error" });
  }
});

app.delete("/expenses/:id_user/:id", authenticateToken, async (req, res) => {
  const { id_user, id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM "expenses" WHERE id = $1 AND user_id = $2 RETURNING *;',
      [id, id_user]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Entry not found or does not belong to this user",
      });
    }

    res.status(200).json({ message: "Successfully deleted" });
  } catch (err) {
    console.error("Error while deleting:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/monthly_expenses/:user_id", authenticateToken, async (req, res) => {
  const { user_id } = req.params;
  try {
    const result = await pool.query(
      "SELECT monthly_expenses.id, monthly_expenses.user_id, monthly_expenses.amount, monthly_expenses.name, monthly_expenses.category_id, categories.category, monthly_expenses.date_start, monthly_expenses.date_end FROM public.monthly_expenses JOIN public.categories on monthly_expenses.category_id = categories.id WHERE monthly_expenses.user_id = $1",
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error while fetching monthly Expenses:", err);
    res.status(500).json({ error: "Internal  Server Error" });
  }
});

app.get(
  "/monthly_expenses/:user_id/search",
  authenticateToken,
  async (req, res) => {
    const { user_id } = req.params;
    const { monthYear } = req.query;
    // zum Beispiel
    // localhost:5005/monthly_expenses/1/search?monthYear=2025-05

    try {
      let query = `
      SELECT 
        monthly_expenses.id, 
        monthly_expenses.user_id, 
        monthly_expenses.amount, 
        monthly_expenses.name, 
        monthly_expenses.category_id, 
        categories.category, 
        monthly_expenses.date_start, 
        monthly_expenses.date_end
      FROM public.monthly_expenses
      JOIN public.categories ON monthly_expenses.category_id = categories.id
      WHERE monthly_expenses.user_id = $1
    `;

      const values = [user_id];

      if (monthYear) {
        const [year, month] = monthYear.split("-").map(Number);

        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0);
        const isoMonthStart = monthStart.toISOString().split("T")[0];
        const isoMonthEnd = monthEnd.toISOString().split("T")[0];

        query += `
        AND (
          (monthly_expenses.date_start <= $2 AND (monthly_expenses.date_end IS NULL OR monthly_expenses.date_end >= $3))
        )
      `;
        values.push(isoMonthEnd, isoMonthStart);
      }

      query += " ORDER BY monthly_expenses.date_start DESC";

      const result = await pool.query(query, values);
      res.json(result.rows);
    } catch (err) {
      console.error("Fehler beim Abrufen der monatlichen Ausgaben:", err);
      res.status(500).json({ error: "Interner Serverfehler" });
    }
  }
);

app.post("/monthly_expenses", authenticateToken, async (req, res) => {
  const { user_id, category_id, amount, name, date_start, date_end } = req.body;

  if (!user_id || !category_id || !amount || !date_start) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO monthly_expenses (user_id, category_id, amount, name, date_start, date_end)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, category_id, amount, name, date_start, date_end]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error while inserting monthly_expenses:", err);
    res.status(500).json({ error: "Internal  Server Error" });
  }
});

// DELETE: Monatlichen Eintrag löschen
app.delete(
  "/monthly_expenses/:id_user/:id",
  authenticateToken,
  async (req, res) => {
    const { id_user, id } = req.params;
    const new_date = new Date();

    try {
      const existingResult = await pool.query(
        'SELECT "date_start" FROM "monthly_expenses" WHERE id = $1 AND user_id = $2;',
        [id, id_user]
      );

      if (existingResult.rowCount === 0) {
        return res.status(404).json({
          error: "Entry not found or does not belong to this user",
        });
      }

      const { date_start } = existingResult.rows[0];

      if (new Date(date_start) > new_date) {
        await pool.query(
          'DELETE FROM "monthly_expenses" WHERE id = $1 AND user_id = $2;',
          [id, id_user]
        );

        return res.status(200).json({ message: "Erfolgreich gelöscht" });
      }

      const result = await pool.query(
        'UPDATE  "monthly_expenses" SET date_end = $1 WHERE id = $2 AND user_id = $3 RETURNING *;',
        [new_date, id, id_user]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          error: "Entry not found or does not belong to this user",
        });
      }

      res.status(200).json({ message: "Successfully deleted " });
    } catch (err) {
      console.error("Error while deleting:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

app.get("/incomes/:user_id", authenticateToken, async (req, res) => {
  const { user_id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM "incomes" WHERE user_id = $1',
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error while fetching  Expenses:", err);
    res.status(500).json({ error: "Internal  Server Error" });
  }
});

app.get("/incomes/:user_id/search", authenticateToken, async (req, res) => {
  const { user_id } = req.params;
  const { monthYear } = req.query;

  // zum Beispiel
  // localhost:5005/incomes/1/search?monthYear=2025-05
  try {
    let query = `
      SELECT incomes.id, incomes.user_id, incomes.amount, incomes.name, incomes.date 
      FROM public.incomes 
      WHERE incomes.user_id = $1
    `;
    const values = [user_id];
    if (monthYear) {
      const [year, month] = monthYear.split("-").map(Number);
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0);

      const isoStart = monthStart.toISOString().split("T")[0]; // YYYY-MM-DD
      const isoEnd = monthEnd.toISOString().split("T")[0]; // YYYY-MM-DD

      query += ` AND incomes.date BETWEEN $2 AND $3`;
      values.push(isoStart, isoEnd);
    }

    query += " ORDER BY incomes.date DESC";

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("Error while fetching the incomes: ", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/incomes", authenticateToken, async (req, res) => {
  const { user_id, amount, name, date } = req.body;

  if (!user_id || !amount || !date) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO "incomes" (user_id, "amount", name, date)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user_id, amount, name || "", date]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error while inserting  Expenses:", err);
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

app.post("/monthly_incomes", authenticateToken, async (req, res) => {
  const { user_id, amount, name, date_start, date_end } = req.body;

  if (!user_id || !amount || !date_start) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO monthly_incomes (user_id, amount, name, date_start, date_end)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user_id, amount, name, date_start, date_end]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error while inserting monthly_incomes:", err);
    res.status(500).json({ error: "Internal  Server Error" });
  }
});

app.get("/monthly_incomes/:user_id", authenticateToken, async (req, res) => {
  const { user_id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM "monthly_incomes" WHERE user_id = $1',
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error while fetching: ", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get(
  "/monthly_incomes/:user_id/search",
  authenticateToken,
  async (req, res) => {
    const { user_id } = req.params;
    const { monthYear } = req.query;
    // zum Beispiel
    // localhost:5005/monthly_incomes/1/search?monthYear=2025-05

    try {
      let query = `
      SELECT 
        monthly_incomes.id, 
        monthly_incomes.user_id, 
        monthly_incomes.amount, 
        monthly_incomes.name, 
        monthly_incomes.date_start, 
        monthly_incomes.date_end
      FROM public.monthly_incomes
      WHERE monthly_incomes.user_id = $1
    `;

      const values = [user_id];

      if (monthYear) {
        const [year, month] = monthYear.split("-").map(Number);

        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0);
        const isoMonthStart = monthStart.toISOString().split("T")[0];
        const isoMonthEnd = monthEnd.toISOString().split("T")[0];

        query += `
        AND (
          (monthly_incomes.date_start <= $2 AND (monthly_incomes.date_end IS NULL OR monthly_incomes.date_end >= $3))
        )
      `;
        values.push(isoMonthEnd, isoMonthStart);
      }

      query += " ORDER BY monthly_incomes.date_start DESC";

      const result = await pool.query(query, values);
      res.json(result.rows);
    } catch (err) {
      console.error("Fehler beim Abrufen der monatlichen Einnahmen:", err);
      res.status(500).json({ error: "Interner Serverfehler" });
    }
  }
);

app.put(
  "/monthly_incomes/:id_user/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const { id, id_user } = req.params;
      const { amount, name } = req.body;
      // Calcul first day of next month
      const nextMonthFirstDay = new Date();

      nextMonthFirstDay.setMonth(nextMonthFirstDay.getMonth() + 1);
      nextMonthFirstDay.setDate(1);
      const lastDay = new Date(nextMonthFirstDay);
      lastDay.setDate(lastDay.getDate() - 1);
      nextMonthFirstDay.setUTCHours(0, 0, 0, 0);
      lastDay.setUTCHours(0, 0, 0, 0);
      console.log(nextMonthFirstDay, lastDay);

      const selectQuery = `
      SELECT * FROM monthly_incomes
      WHERE id = $1 AND user_id = $2;
    `;
      const { rows: originalRows } = await pool.query(selectQuery, [
        id,
        id_user,
      ]);

      if (originalRows.length === 0) {
        return res.status(404).send("Income not found");
      }
      const original = originalRows[0];
      const isSame =
        parseFloat(original.amount) === parseFloat(amount) &&
        original.name === name;
      if (isSame) {
        return res.status(200).json({ message: "No changes detected" });
      }

      const updateQuery = `
      UPDATE monthly_incomes
      SET date_end = $1
      WHERE id = $2 AND user_id = $3
      RETURNING *;
    `;
      await pool.query(updateQuery, [lastDay, id, id_user]);

      const insertQuery = `
      INSERT INTO monthly_incomes (user_id, amount, name, date_start)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
      const insertValues = [id_user, amount, name, nextMonthFirstDay];
      const { rows: newRows } = await pool.query(insertQuery, insertValues);
      res.status(200).json({
        message: "Income updated with versioning",
        newEntry: newRows[0],
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("An error occurred");
    }
  }
);

app.post("/login", async (req, res) => {
  const { e_mail, password } = req.body;
  console.log("Request login:", e_mail, password);

  try {
    const result = await pool.query("SELECT * FROM users WHERE e_mail = $1", [
      e_mail,
    ]);
    const user = result.rows[0];

    if (!user) {
      return res.json({ error: "e_mail incorrect!" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Passwort incorrect!" });
    }

    const token = jwt.sign(
      { userId: user.id, e_mail: user.e_mail },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Connexion OK",
      user: { id: user.id, e_mail: user.e_mail },
      token,
    });
  } catch (error) {
    console.error("Error login:", error);
    res.status(500).json({ error: "Error server" });
  }
});

app.put("/income/:id_user/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { id_user } = req.params;
    const { amount, name, date } = req.body;

    const query = `
      UPDATE "incomes"
      SET amount = $1, name = $2, date = $3    WHERE id = $4 AND user_id = $5
      RETURNING *;
    `;
    const values = [amount, name, date, id, id_user];

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(404).send("Cannot find the income");
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
});
app.delete("/income/:id_user/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const user_id = req.params.id_user;

    const query =
      'DELETE FROM "incomes" WHERE id = $1 AND user_id= $2 RETURNING *;';

    const { rows } = await pool.query(query, [id, user_id]);

    if (rows.length === 0) {
      return res.status(404).send("cannot find the incomes");
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("some error has occured");
  }
});

app.delete(
  "/monthly_incomes/:id_user/:id",
  authenticateToken,
  async (req, res) => {
    const { id_user, id } = req.params;
    const new_date = new Date(); // heutiges Datum

    try {
      const existingResult = await pool.query(
        'SELECT "date_start" FROM "monthly_incomes" WHERE id = $1 AND user_id = $2;',
        [id, id_user]
      );

      if (existingResult.rowCount === 0) {
        return res.status(404).json({
          error: "Entry not found or does not belong to this user",
        });
      }

      const { date_start } = existingResult.rows[0];

      if (new Date(date_start) > new_date) {
        await pool.query(
          'DELETE FROM "monthly_incomes" WHERE id = $1 AND user_id = $2;',
          [id, id_user]
        );

        return res.status(200).json({ message: "Successfully deleted" });
      }

      const result = await pool.query(
        'UPDATE "monthly_incomes" SET date_end = $1 WHERE id = $2 AND user_id = $3 RETURNING *;',
        [new_date, id, id_user]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          error: "Entry not found or does not belong to this user",
        });
      }

      res.status(200).json({ message: "Successfully deleted" });
    } catch (err) {
      console.error("Error while deleting:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

app.put("/expenses/:id_user/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { id_user } = req.params;

    const { category_id, amount, name, date } = req.body;

    const query = `
    UPDATE "expenses"
    SET category_id=$1, amount=$2, name=$3, date=$4
    WHERE id=$5 AND user_id=$6
    RETURNING *;`;
    const values = [category_id, amount, name, date, id, id_user];

    const { rows } = await pool.query(query, values);
    if (rows.lenght == 0) {
      return res.status(404).send("cannot find the expenses");
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).send("some error has occured");
  }
});
app.get("/expenses/search", authenticateToken, async (req, res) => {
  const { year } = req.query; // Get the year from the query string

  if (!year) {
    return res.status(400).json({ error: "Year is required" });
  }

  try {
    // Log the incoming year to verify it's being received correctly
    console.log(`Received request for expenses in year: ${year}`);

    // Query both regular expenses and monthly expenses for the given year
    const result = await pool.query(
      `
      SELECT amount FROM public.expenses WHERE EXTRACT(YEAR FROM date) = $1
      UNION ALL
      SELECT amount FROM public.monthly_expenses WHERE EXTRACT(YEAR FROM date) = $1
      `,
      [year]
    );

    // Log the result of the query to check if it returns expected data
    console.log("Query Result:", result.rows);

    // Check if any expenses were found
    if (result.rows.length === 0) {
      console.log("No expenses found for the given year");
      return res
        .status(404)
        .json({ error: "No expenses found for the given year" });
    }

    // Calculate the total amount
    const totalAmount = result.rows.reduce(
      (sum, row) => sum + parseFloat(row.amount),
      0
    );

    // Calculate the average expense
    const averageAmount = totalAmount / result.rows.length;

    // Log the total and average for verification
    console.log(
      `Total Expenses: €${totalAmount.toFixed(
        2
      )}, Average Expense: €${averageAmount.toFixed(2)}`
    );

    res.json({
      year: year,
      totalExpenses: totalAmount.toFixed(2),
      averageExpense: averageAmount.toFixed(2),
    });
  } catch (err) {
    // Log the error for debugging purposes
    console.error("Error calculating average expenses:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/piedata/:id_user", authenticateToken, async (req, res) => {
  const { year, month } = req.body;
  const { id_user } = req.params;

  console.log(`Request for year: ${year}, month: ${month}`);

  let result;
  let monthly_result;

  try {
    // Hier wird kontroliert ob mindestens ein Datei --> Expense existiert für (Jahr, Monat, User)
    // Hier werden vom Datum das Jahr und den Monat herausgeholt --> extract
    result = await pool.query(
      `SELECT EXISTS (
         SELECT 1 FROM expenses
         WHERE user_id = $1 
          AND EXTRACT(YEAR FROM date) = $2 
          AND EXTRACT(MONTH FROM date) = $3
       )`,
      [id_user, year, month]
    );
  } catch (err) {
    console.error("Error checking expenses:", err);
    res.status(500).json({ error: "Internal server error" });
  }

  try {
    monthly_result = await pool.query(
      `SELECT EXISTS (
         SELECT 1 FROM monthly_expenses
         WHERE user_id = $1 AND
          ( (EXTRACT(YEAR FROM date_start) < $2
            OR (EXTRACT(YEAR FROM date_start) = $2
                AND EXTRACT(MONTH FROM date_start) <= $3)
            ) AND
		    	(date_end IS NULL OR
           ((EXTRACT(YEAR FROM date_end) > $2
             OR (EXTRACT(MONTH FROM date_end) = $2)
                 AND EXTRACT(MONTH FROM date_end)>= $3
    ))
          )
         )
       )`,
      [id_user, year, month]
    );
  } catch (err) {
    console.error("Error checking monthly expenses:", err);
    res.status(500).json({ error: "Internal server error" });
  }

  // If no data is returned  (expense & monthly expense), send an empty response
  if (!result.rows[0].exists && !monthly_result.rows[0].exists) {
    return res.json({
      labels: [],
      datasets: [
        {
          label: "Expenses",
          data: [],
          backgroundColor: [],
          borderWidth: 1,
        },
      ],
    });
  }

  // SQL query to join expenses and categories tables and sum the amounts per category
  result = await pool.query(
    `SELECT c.category, COALESCE(SUM(e.amount), 0) AS total_amount
       FROM categories c
       LEFT JOIN expenses e ON c.id = e.category_id AND e.user_id = $1
       AND EXTRACT(YEAR FROM e.date) = $2
       AND EXTRACT(MONTH FROM e.date) = $3
       GROUP BY c.category
       ORDER BY total_amount DESC;`,
    [id_user, year, month]
  );

  monthly_result = await pool.query(
    `SELECT c.category, COALESCE(SUM(e.amount), 0) AS total_amount
       FROM categories c
       LEFT JOIN monthly_expenses e ON c.id = e.category_id AND e.user_id = $1 AND
         ( (EXTRACT(YEAR FROM date_start) < $2
            OR (EXTRACT(YEAR FROM date_start) = $2
                AND EXTRACT(MONTH FROM date_start) <= $3)
            ) AND
		      (date_end IS NULL OR
           (EXTRACT(YEAR FROM date_end) > $2
             OR (EXTRACT(YEAR FROM date_end) = $2
                 AND EXTRACT(MONTH FROM date_end) >= $3
			      ))
          )
         )
       GROUP BY c.category
       ORDER BY total_amount DESC;`,
    [id_user, year, month]
  );

  // Merge and sum up the results monthly and non monthly
  const categoryMap = new Map();

  for (const row of result.rows) {
    categoryMap.set(row.category, row.total_amount);
  }

  for (const row of monthly_result.rows) {
    categoryMap.set(
      row.category,
      (categoryMap.get(row.category) || 0) + row.total_amount
    );
  }
  // Sort the map by category (keys) alphabetically
  // Otherwise the pie chart colors per category will always change when new data is fetched
  const sortedCategoryMap = new Map(
    Array.from(categoryMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  );

  // Prepare the data for the pie chart
  const categories = Array.from(sortedCategoryMap.keys());
  const totalAmounts = Array.from(sortedCategoryMap.values());

  const backgroundColors = categories.map((_, index) => {
    const colors = [
      // "rgba(255, 99, 132, 0.6)",
      " rgba(230, 138, 129, 1)",
      // "rgba(54, 162, 235, 0.6)",
      // "rgba(255, 206, 86, 0.6)",
      // "rgba(75, 192, 192, 0.6)",
      // "rgba(110, 75, 192, 0.6)",
      "rgba(4, 137, 169, 1)",
      //"rgba(251, 191, 36, 1)",
      "rgba(245, 200, 88, 1)",
      "rgba(75, 192, 192, 0.6)",
      //"rgba(4, 137, 169, 1)",
      "rgba(110, 75, 192, 0.6)",
    ];
    return colors[index % colors.length]; // Repeat the colors if there are more than 5 categories
  });

  const data = {
    labels: categories,
    datasets: [
      {
        label: "Expenses",
        data: totalAmounts,
        backgroundColor: backgroundColors,
        borderWidth: 1,
      },
    ],
  };

  res.json(data);
});

app.post(
  "/barchartdata/:id_user",
  authenticateToken,
  (async = async (req, res) => {
    const { year, month } = req.body;
    const { id_user } = req.params;
    console.log(`Request bar chart data for year: ${year}, month: ${month}`);
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    let chartData = [
      { month: "", expenses: 0.0, income: 0.0 },
      { month: "", expenses: 0.0, income: 0.0 },
      { month: "", expenses: 0.0, income: 0.0 },
      { month: "", expenses: 0.0, income: 0.0 },
      { month: "", expenses: 0.0, income: 0.0 },
      { month: "", expenses: 0.0, income: 0.0 },
      { month: "", expenses: 0.0, income: 0.0 },
      { month: "", expenses: 0.0, income: 0.0 },
      { month: "", expenses: 0.0, income: 0.0 },
      { month: "", expenses: 0.0, income: 0.0 },
      { month: "", expenses: 0.0, income: 0.0 },
      { month: "", expenses: 0.0, income: 0.0 },
    ];
    for (let i = 0; i < 12; i++) {
      let i_month = month - i;
      let i_year = year;
      if (i_month < 1) {
        i_month = 12 + i_month;
        i_year--;
      }
      chartData[11 - i].month = months[i_month - 1];
      let result;
      try {
        result = await pool.query(
          `SELECT COALESCE(SUM(e.amount), 0) AS total_amount
          FROM expenses e
          WHERE e.user_id = $1
            AND EXTRACT(YEAR FROM e.date) = $2
            AND EXTRACT(MONTH FROM e.date) = $3;`,
          [id_user, i_year, i_month]
        );
      } catch (err) {
        console.error("Error checking expenses:", err);
        res.status(500).json({ error: "Internal server error" });
      }
      chartData[11 - i].expenses = result.rows[0].total_amount;

      try {
        result = await pool.query(
          `SELECT COALESCE(SUM(e.amount), 0) AS total_amount
            FROM monthly_expenses e
            WHERE e.user_id = $1 AND
              ( (EXTRACT(YEAR FROM date_start) < $2
                OR (EXTRACT(YEAR FROM date_start) = $2
                    AND EXTRACT(MONTH FROM date_start) <= $3)
                ) AND
              (date_end IS NULL OR
              (EXTRACT(YEAR FROM date_end) > $2
                OR (EXTRACT(YEAR FROM date_end) = $2
                    AND EXTRACT(MONTH FROM date_end) >= $3
                ))
              )
            )`,
          [id_user, i_year, i_month]
        );
      } catch (err) {
        console.error("Error checking rxpenses:", err);
        res.status(500).json({ error: "Internal server error" });
      }

      chartData[11 - i].expenses =
        chartData[11 - i].expenses + result.rows[0].total_amount;

      try {
        result = await pool.query(
          `SELECT COALESCE(SUM(i.amount), 0) AS total_amount
          FROM incomes i
          WHERE i.user_id = $1
            AND EXTRACT(YEAR FROM i.date) = $2
            AND EXTRACT(MONTH FROM i.date) = $3;`,
          [id_user, i_year, i_month]
        );
      } catch (err) {
        console.error("Error checking incomes:", err);
        res.status(500).json({ error: "Internal server error" });
      }
      chartData[11 - i].income = result.rows[0].total_amount;

      try {
        result = await pool.query(
          `SELECT COALESCE(SUM(i.amount), 0) AS total_amount
            FROM monthly_incomes i
            WHERE i.user_id = $1 AND
              ( (EXTRACT(YEAR FROM date_start) < $2
                OR (EXTRACT(YEAR FROM date_start) = $2
                    AND EXTRACT(MONTH FROM date_start) <= $3)
                ) AND
              (date_end IS NULL OR
              (EXTRACT(YEAR FROM date_end) > $2
                OR (EXTRACT(YEAR FROM date_end) = $2
                    AND EXTRACT(MONTH FROM date_end) >= $3
                ))
              )
            )`,
          [id_user, i_year, i_month]
        );
      } catch (err) {
        console.error("Error checking incomes:", err);
        res.status(500).json({ error: "Internal server error" });
      }

      chartData[11 - i].income =
        chartData[11 - i].income + result.rows[0].total_amount;
    } // for
    return res.json(chartData);
  })
);

app.put(
  "/monthly_expenses/:id_user/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const { id, id_user } = req.params;
      const { category_id, amount, name } = req.body;

      // Calcul first day of next month
      const nextMonthFirstDay = new Date();

      nextMonthFirstDay.setMonth(nextMonthFirstDay.getMonth() + 1);
      nextMonthFirstDay.setDate(1);
      const lastDay = new Date(nextMonthFirstDay);
      lastDay.setDate(lastDay.getDate() - 1);
      nextMonthFirstDay.setUTCHours(0, 0, 0, 0);
      lastDay.setUTCHours(0, 0, 0, 0);
      console.log(nextMonthFirstDay, lastDay);

      const selectQuery = `
      SELECT * FROM monthly_expenses
      WHERE id = $1 AND user_id = $2;
    `;
      const { rows: originalRows } = await pool.query(selectQuery, [
        id,
        id_user,
      ]);

      if (originalRows.length === 0) {
        return res.status(404).send("Expense not found");
      }

      const original = originalRows[0];

      const isSame =
        parseFloat(original.amount) === parseFloat(amount) &&
        original.name === name &&
        parseInt(original.category_id) === parseInt(category_id);

      if (isSame) {
        return res.status(200).json({ message: "No changes detected" });
      }

      const updateQuery = `
      UPDATE monthly_expenses
      SET date_end = $1
      WHERE id = $2 AND user_id = $3
      RETURNING *;
    `;
      await pool.query(updateQuery, [lastDay, id, id_user]);

      const insertQuery = `
      INSERT INTO monthly_expenses (user_id, amount, name, category_id, date_start)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
      const insertValues = [
        id_user,
        amount,
        name,
        category_id,
        nextMonthFirstDay,
      ];
      const { rows: newRows } = await pool.query(insertQuery, insertValues);

      res.status(200).json({
        message: "Expense updated",
        newEntry: newRows[0],
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("An error occurred");
    }
  }
);
////////////////////////////////////////
app.get(
  "/monthly_expenses/sum/:user_id",
  authenticateToken,
  async (req, res) => {
    const { user_id } = req.params;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // janvier = 0
    const currentYear = currentDate.getFullYear();

    try {
      const result = await pool.query(
        `SELECT SUM(amount) AS total_monthly_expenses
       FROM monthly_expenses
       WHERE user_id = $1
         AND (
           (EXTRACT(YEAR FROM date_start) < $2 OR 
           (EXTRACT(YEAR FROM date_start) = $2 AND EXTRACT(MONTH FROM date_start) <= $3))
         )
         AND (
           date_end IS NULL OR 
           (EXTRACT(YEAR FROM date_end) > $2 OR 
           (EXTRACT(YEAR FROM date_end) = $2 AND EXTRACT(MONTH FROM date_end) >= $3))
         );`,
        [user_id, currentYear, currentMonth]
      );

      res.json({ totalMonthlyExpenses: result.rows[0].total_monthly_expenses });
    } catch (err) {
      console.error("Error calculating monthly expenses:", err);
      res.status(500).json({ error: "Error server" });
    }
  }
);

app.get(
  "/monthly_incomes/sum/:user_id",
  authenticateToken,
  async (req, res) => {
    const { user_id } = req.params;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // janvier = 0
    const currentYear = currentDate.getFullYear();

    try {
      const result = await pool.query(
        `SELECT SUM(amount) AS total_monthly_incomes
       FROM monthly_incomes
       WHERE user_id = $1
         AND (
           (EXTRACT(YEAR FROM date_start) < $2 OR 
           (EXTRACT(YEAR FROM date_start) = $2 AND EXTRACT(MONTH FROM date_start) <= $3))
         )
         AND (
           date_end IS NULL OR 
           (EXTRACT(YEAR FROM date_end) > $2 OR 
           (EXTRACT(YEAR FROM date_end) = $2 AND EXTRACT(MONTH FROM date_end) >= $3))
         );`,
        [user_id, currentYear, currentMonth]
      );

      res.json({ totalMonthlyIncomes: result.rows[0].total_monthly_incomes });
    } catch (err) {
      console.error("Error calculating monthly incomes:", err);
      res.status(500).json({ error: "Error server" });
    }
  }
);

app.get("/expenses/sum/:user_id", authenticateToken, async (req, res) => {
  const { user_id } = req.params;

  try {
    const expensesResult = await pool.query(
      `
        SELECT SUM(amount) AS total_expenses
        FROM expenses
        WHERE user_id = $1
          AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
          AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE);
        `,
      [user_id]
    );

    res.json({ totalExpenses: expensesResult.rows[0].total_expenses });
  } catch (err) {
    console.error("Error calculating monthly expenses:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/incomes/sum/:user_id", authenticateToken, async (req, res) => {
  const { user_id } = req.params;

  try {
    const incomesResult = await pool.query(
      `
        SELECT SUM(amount) AS total_incomes
        FROM incomes
        WHERE user_id = $1
          AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
          AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE);
        `,
      [user_id]
    );

    res.json({ totalIncomes: incomesResult.rows[0].total_incomes });
  } catch (err) {
    console.error("Error calculating monthly incomes:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/total_balance/:user_id", authenticateToken, async (req, res) => {
  const { user_id } = req.params;

  try {
    const expensesQuery = `
      SELECT SUM(amount) AS total
      FROM expenses
      WHERE user_id = $1
        AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)
    `;

    const monthlyExpensesQuery = `
      SELECT SUM(amount) AS total
      FROM monthly_expenses
      WHERE user_id = $1
        AND date_start <= DATE_TRUNC('month', CURRENT_DATE)
        AND (date_end IS NULL OR date_end >= DATE_TRUNC('month', CURRENT_DATE))
    `;

    const incomeQuery = `
      SELECT SUM(amount) AS total
      FROM incomes
      WHERE user_id = $1
        AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)
    `;

    const monthlyIncomeQuery = `
      SELECT SUM(amount) AS total
      FROM monthly_incomes
      WHERE user_id = $1
        AND date_start <= DATE_TRUNC('month', CURRENT_DATE)
        AND (date_end IS NULL OR date_end >= DATE_TRUNC('month', CURRENT_DATE))
    `;

    const [expensesResult, monthlyExpResult, incomeResult, monthlyIncResult] =
      await Promise.all([
        pool.query(expensesQuery, [user_id]),
        pool.query(monthlyExpensesQuery, [user_id]),
        pool.query(incomeQuery, [user_id]),
        pool.query(monthlyIncomeQuery, [user_id]),
      ]);

    const totalExpenses =
      (expensesResult.rows[0].total || 0) +
      (monthlyExpResult.rows[0].total || 0);

    const totalIncome =
      (incomeResult.rows[0].total || 0) + (monthlyIncResult.rows[0].total || 0);

    let balance = totalIncome - totalExpenses;

    let debitPerMonth = null;
    let message = null;
    if (balance < 0) {
      message = `To recover your balance, you need to divide the debit over the next 4 months. Save ${Math.abs(
        debitPerMonth
      ).toFixed(2)} € each month to avoid further debt.`;
    }

    if (totalExpenses > totalIncome) {
      message = "Warning: Your expenses exceed your income this month!";
    }

    res.json({
      totalExpenses,
      totalIncome,
      balance,
      debitPerMonth,
      message,
    });
  } catch (err) {
    console.error("Error calculating totals:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/signup", async (req, res) => {
  const { e_mail, name, password } = req.body;

  try {
    // Check if the email is already registered
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE e_mail = $1",
      [e_mail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "This email is already in use." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const result = await pool.query(
      "INSERT INTO users (name, password, e_mail) VALUES ($1, $2, $3) RETURNING *",
      [name, hashedPassword, e_mail]
    );

    // Send back the newly created user (excluding password)
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/download-expenses/:user_id", authenticateToken, async (req, res) => {
  const { user_id } = req.params;

  try {
    const PDFDocument = require("pdfkit");
    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Disposition", "attachment; filename=expenses.pdf");
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    const [
      expensesResult,
      monthlyExpensesResult,
      incomesResult,
      monthlyIncomesResult,
    ] = await Promise.all([
      pool.query(
        `
        SELECT e.id, e.user_id, e.amount, e.name, e.date, c.category
        FROM expenses e
        JOIN categories c ON e.category_id = c.id
        WHERE e.user_id = $1 AND date_trunc('month', e.date) = date_trunc('month', CURRENT_DATE)
        ORDER BY e.date DESC`,
        [user_id]
      ),

      pool.query(
        `
        SELECT me.id, me.user_id, me.amount, me.name, me.date_start, me.date_end, c.category
        FROM monthly_expenses me
        JOIN categories c ON me.category_id = c.id
        WHERE me.user_id = $1 AND CURRENT_DATE BETWEEN me.date_start AND me.date_end
        ORDER BY me.date_start DESC`,
        [user_id]
      ),

      pool.query(
        `
        SELECT id, user_id, amount, name, date
        FROM incomes
        WHERE user_id = $1 AND date_trunc('month', date) = date_trunc('month', CURRENT_DATE)
        ORDER BY date DESC`,
        [user_id]
      ),

      pool.query(
        `
        SELECT id, user_id, amount, name, date_start, date_end
        FROM monthly_incomes
        WHERE user_id = $1 AND CURRENT_DATE BETWEEN date_start AND date_end
        ORDER BY date_start DESC`,
        [user_id]
      ),
    ]);

    const expenses = expensesResult.rows;
    const monthlyExpenses = monthlyExpensesResult.rows;
    const incomes = incomesResult.rows;
    const monthlyIncomes = monthlyIncomesResult.rows;

    if (
      expenses.length === 0 &&
      monthlyExpenses.length === 0 &&
      incomes.length === 0 &&
      monthlyIncomes.length === 0
    ) {
      return res
        .status(404)
        .json({ error: "No data found for the current month" });
    }

    const [
      expTotalResult,
      monExpTotalResult,
      incTotalResult,
      monIncTotalResult,
    ] = await Promise.all([
      pool.query(
        `
        SELECT SUM(amount) AS total FROM expenses
        WHERE user_id = $1 AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)`,
        [user_id]
      ),
      pool.query(
        `
        SELECT SUM(amount) AS total FROM monthly_expenses
        WHERE user_id = $1 AND date_start <= DATE_TRUNC('month', CURRENT_DATE)
        AND (date_end IS NULL OR date_end >= DATE_TRUNC('month', CURRENT_DATE))`,
        [user_id]
      ),
      pool.query(
        `
        SELECT SUM(amount) AS total FROM incomes
        WHERE user_id = $1 AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)`,
        [user_id]
      ),
      pool.query(
        `
        SELECT SUM(amount) AS total FROM monthly_incomes
        WHERE user_id = $1 AND date_start <= DATE_TRUNC('month', CURRENT_DATE)
        AND (date_end IS NULL OR date_end >= DATE_TRUNC('month', CURRENT_DATE))`,
        [user_id]
      ),
    ]);

    const totalExpenses =
      (expTotalResult.rows[0].total || 0) +
      (monExpTotalResult.rows[0].total || 0);
    const totalIncome =
      (incTotalResult.rows[0].total || 0) +
      (monIncTotalResult.rows[0].total || 0);
    const balance = totalIncome - totalExpenses;
    const currentMonth = new Date().toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    doc
      .fontSize(20)
      .text(`Monthly Overview - ${currentMonth}`, { align: "center" });
    doc.moveDown(1);
    doc
      .fontSize(14)
      .fillColor("red")
      .text(`Total Expenses: ${totalExpenses.toFixed(2)} €`);
    doc.fillColor("green").text(`Total Income: ${totalIncome.toFixed(2)} €`);
    doc.fillColor("darkgreen").text(`Balance: ${balance.toFixed(2)} €`);
    doc.moveDown(2);

    // Récupérer la position Y courante après résumé
    let currentY = doc.y;

    function drawTable(headers, rows, startX, startY, columnWidths) {
      const rowHeight = 20;
      let y = startY;
      const tableWidth = columnWidths.reduce((a, b) => a + b, 0);

      function drawHeader() {
        doc.rect(startX, y, tableWidth, rowHeight).fill("#d3d3d3").stroke();
        doc.fillColor("black").font("Helvetica-Bold").fontSize(12);
        let x = startX;
        headers.forEach((header, i) => {
          doc.text(header, x + 5, y + 5, { width: columnWidths[i] - 10 });
          x += columnWidths[i];
        });
        y += rowHeight;
        doc.font("Helvetica").fontSize(11);
      }

      drawHeader();

      rows.forEach((row, index) => {
        if (y + rowHeight > doc.page.height - 50) {
          doc.addPage();
          y = 50;
          drawHeader();
        }
        let x = startX;
        if (index % 2 === 0) {
          doc.rect(startX, y, tableWidth, rowHeight).fill("#f9f9f9").stroke();
        }
        doc.fillColor("black");
        row.forEach((cell, i) => {
          doc.text(cell, x + 5, y + 5, { width: columnWidths[i] - 10 });
          x += columnWidths[i];
        });
        x = startX;
        for (let i = 0; i < columnWidths.length; i++) {
          doc.rect(x, y, columnWidths[i], rowHeight).stroke();
          x += columnWidths[i];
        }
        y += rowHeight;
      });
    }

    // One-Time Expenses : affiche juste après résumé
    if (expenses.length > 0) {
      doc
        .fontSize(16)
        .fillColor("black")
        .text("One-Time Expenses", 50, currentY, { underline: true });
      currentY += 25; // décaler pour le tableau
      const headers = ["Date", "Name", "Category", "Amount (€)"];
      const widths = [100, 150, 150, 100];
      const rows = expenses.map((exp) => [
        new Date(exp.date).toLocaleDateString("en-GB"),
        exp.name,
        exp.category,
        parseFloat(exp.amount).toFixed(2),
      ]);
      drawTable(headers, rows, 50, currentY, widths);
      doc.addPage();
    }

    // Monthly Expenses (nouvelle page)
    if (monthlyExpenses.length > 0) {
      doc
        .fontSize(16)
        .fillColor("black")
        .text("Monthly Expenses", 50, 50, { underline: true });
      const headers = [
        "Start Date",
        "End Date",
        "Name",
        "Category",
        "Amount (€)",
      ];
      const widths = [80, 80, 150, 150, 100];
      const rows = monthlyExpenses.map((exp) => [
        new Date(exp.date_start).toLocaleDateString("en-GB"),
        new Date(exp.date_end).toLocaleDateString("en-GB"),
        exp.name,
        exp.category,
        parseFloat(exp.amount).toFixed(2),
      ]);
      drawTable(headers, rows, 50, 80, widths);
      doc.addPage();
    }

    // One-Time Incomes (nouvelle page)
    if (incomes.length > 0) {
      doc
        .fontSize(16)
        .fillColor("black")
        .text("One-Time Incomes", 50, 50, { underline: true });
      const headers = ["Date", "Name", "Amount (€)"];
      const widths = [100, 200, 100];
      const rows = incomes.map((inc) => [
        new Date(inc.date).toLocaleDateString("en-GB"),
        inc.name,
        parseFloat(inc.amount).toFixed(2),
      ]);
      drawTable(headers, rows, 50, 80, widths);
      doc.addPage();
    }

    // Monthly Incomes (nouvelle page)
    if (monthlyIncomes.length > 0) {
      doc
        .fontSize(16)
        .fillColor("black")
        .text("Monthly Incomes", 50, 50, { underline: true });
      const headers = ["Start Date", "End Date", "Name", "Amount (€)"];
      const widths = [80, 80, 200, 100];
      const rows = monthlyIncomes.map((inc) => [
        new Date(inc.date_start).toLocaleDateString("en-GB"),
        new Date(inc.date_end).toLocaleDateString("en-GB"),
        inc.name,
        parseFloat(inc.amount).toFixed(2),
      ]);
      drawTable(headers, rows, 50, 80, widths);
    }

    doc.end();
  } catch (err) {
    console.error("Error generating PDF:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server läuft: http://localhost:${PORT}`);
});
