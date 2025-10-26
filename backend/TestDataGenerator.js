import { faker } from "@faker-js/faker";
import pg from "pg";
const pool = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "budget",
  password: "sassa",
  port: 5432,
});
const categories = [
  "Shopping",
  "Entertainment",
  "transport",
  "Rent&Energy",
  "Other",
];
async function seedCategories() {
  for (const category of categories) {
    await pool.query(
      `INSERT INTO categories (category)
       VALUES ($1) ON CONFLICT DO NOTHING`,
      [category]
    );
  }
}
const categoryRows = await pool.query(`SELECT id FROM categories LIMIT 5`);
const categoryIds = categoryRows.rows.map((row) => row.id);
const randomCategoryId =
  categoryIds[Math.floor(Math.random() * categoryIds.length)];
async function seedExpenses(user_id, count = 20) {
  await seedCategories();
  const categoryRows = await pool.query(`SELECT id FROM categories LIMIT 5`);
  const categoryIds = categoryRows.rows.map((row) => row.id);
  const randomCategoryId =
    categoryIds[Math.floor(Math.random() * categoryIds.length)];
  for (let i = 0; i < count; i++) {
    const randomCategoryId =
      categoryIds[Math.floor(Math.random() * categoryIds.length)];
    await pool.query(
      `INSERT INTO expenses (user_id, name, amount, date, category_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        user_id,
        faker.commerce.product(),
        parseFloat(faker.finance.amount(5, 150, 2)),
        faker.date.between({ from: "2024-06-01", to: "2025-05-31" }),
        randomCategoryId,
      ]
    );
  }
  console.log(`Seeded ${count} fake expenses for user ${user_id}`);
  await pool.end();
}

seedExpenses(1); // Use actual user_id here
