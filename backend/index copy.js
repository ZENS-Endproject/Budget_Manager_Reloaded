const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { refreshToken } = require("./tokenController");

const app = express();
const PORT = 5005;

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
      "SELECT expenses.id, expenses.user_id, expenses.amount, expenses.name, expenses.category_id, expenses.date, categories.category FROM public.expenses JOIN public.categories on expenses.category_id = categories.id WHERE expenses.user_id = $1",
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Fehler beim Abrufen der Ausgaben:", err);
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

app.get("/expenses/:user_id/search", authenticateToken, async (req, res) => {
  const { user_id } = req.params;
  const { month } = req.query;

  try {
    let query = `
      SELECT expenses.id, expenses.user_id, expenses.amount, expenses.name,
             expenses.category_id, expenses.date, categories.category
      FROM public.expenses
      JOIN public.categories ON expenses.category_id = categories.id
      WHERE expenses.user_id = $1
    `;
    const values = [user_id];

    if (month) {
      const monthNumber = new Date(`${month} 1, 2000`).getMonth() + 1;
      query += " AND EXTRACT(MONTH FROM expenses.date) = $2";
      values.push(monthNumber);
    }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("Fehler beim Abrufen der Ausgaben:", err);
    res.status(500).json({ error: "Interner Serverfehler" });
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
    console.error("Fehler beim Einfügen der Ausgabe:", err);
    res.status(500).json({ error: "Interner Serverfehler" });
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
        error: "Eintrag nicht gefunden oder gehört nicht zu diesem User",
      });
    }

    res.status(200).json({ message: "Erfolgreich gelöscht" });
  } catch (err) {
    console.error("Fehler beim Löschen:", err);
    res.status(500).json({ error: "Interner Serverfehler" });
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
    console.error("Fehler beim Abrufen der monatlichen Ausgaben:", err);
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

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
    console.error("Fehler beim Einfügen in monthly_expenses:", err);
    res.status(500).json({ error: "Interner Serverfehler" });
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
      const result = await pool.query(
        'UPDATE  "monthly_expenses" SET date_end = $1 WHERE id = $2 AND user_id = $3 RETURNING *;',
        [new_date, id, id_user]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          error: "Eintrag nicht gefunden oder gehört nicht zu diesem User",
        });
      }

      res.status(200).json({ message: "Erfolgreich gelöscht" });
    } catch (err) {
      console.error("Fehler beim Löschen:", err);
      res.status(500).json({ error: "Interner Serverfehler" });
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
    console.error("Fehler beim Abrufen der Ausgaben:", err);
    res.status(500).json({ error: "Interner Serverfehler" });
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
    console.error("Fehler beim Einfügen der Ausgabe:", err);
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
    console.error("Fehler beim Einfügen in monthly_incomes:", err);
    res.status(500).json({ error: "Interner Serverfehler" });
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
    console.error("Fehler beim Abrufen: ", err);
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

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

    try {
      const result = await pool.query(
        'DELETE FROM "monthly_incomes" WHERE id = $1 AND user_id = $2 RETURNING *;',
        [id, id_user]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          error: "Eintrag nicht gefunden oder gehört nicht zu diesem User",
        });
      }

      res.status(200).json({ message: "Erfolgreich gelöscht" });
    } catch (err) {
      console.error("Fehler beim Löschen:", err);
      res.status(500).json({ error: "Interner Serverfehler" });
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

  // Prepare the data for the pie chart
  const categories = Array.from(categoryMap.keys());
  const totalAmounts = Array.from(categoryMap.values());

  const backgroundColors = categories.map((_, index) => {
    const colors = [
      "rgba(255, 99, 132, 0.6)",
      "rgba(54, 162, 235, 0.6)",
      "rgba(255, 206, 86, 0.6)",
      "rgba(75, 192, 192, 0.6)",
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
    const { user_id } = req.params;
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

    res.json({
      totalExpenses,
      totalIncome
  
    });
  } 
  catch (err) {
    console.error("Error calculating totals:", err);
    res.status(500).json({ error: "Server error" });
  }}
        // result = await pool.query(
          // `SELECT COALESCE(SUM(e.amount), 0) AS total_amount
        //  FROM expenses e
        //  WHERE e.user_id = $1
          //  AND EXTRACT(YEAR FROM e.date) = $2
          //  AND EXTRACT(MONTH FROM e.date) = $3;`,
          // [id_user, i_year, i_month]
        // );
      // } catch (err) {
        // console.error("Error checking expenses:", err);
        // res.status(500).json({ error: "Internal server error" });
    // }
 // chartData[11 - i].expenses =
        // chartData[11 - i].expenses + result.rows[0].total_amount;


      // try {
        // result = await pool.query(
          // `SELECT COALESCE(SUM(i.amount), 0) AS total_amount
        //  FROM incomes i
        //  WHERE i.user_id = $1
          //  AND EXTRACT(YEAR FROM i.date) = $2
          //  AND EXTRACT(MONTH FROM i.date) = $3;`,
          // [id_user, i_year, i_month]
      // );
      // } catch (err) {
        // console.error("Error checking incomes:", err);
        // res.status(500).json({ error: "Internal server error" });
      // }
      // chartData[11 - i].income =
        // chartData[11 - i].income + result.rows[0].total_amount;
    // }
    // return res.json(chartData);
    
  // })



  
  // chartData[11 - i].monthlyExpensees =
        // chartData[11 - i].monthlyExpensees + result.rows[0].total_amount;
    //  try {
        // result = await pool.query(
          // `SELECT COALESCE(SUM(i.amount), 0) AS total_amount
        //  FROM incomes i
        //  WHERE i.user_id = $1
          //  AND EXTRACT(YEAR FROM i.date) = $2
          //  AND EXTRACT(MONTH FROM i.date) = $3;`,
          // [id_user, i_year, i_month]
        // );
      // } catch (err) {
        // console.error("Error checking incomes:", err);
}        // res.status(500).json({ error: "Internal server error" });}
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

app.listen(PORT, () => {
  console.log(`Server läuft: http://localhost:${PORT}`);
});
