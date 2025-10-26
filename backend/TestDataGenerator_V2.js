import { faker } from "@faker-js/faker";
import { Pool } from "pg";
import { config } from "dotenv";

config();

const pool = new Pool({
  user: process.env.DB_USER, // Dein PostgreSQL-Benutzername
  host: process.env.DB_HOST, // z. B. 'localhost'
  database: process.env.DB_NAME, // Name deiner Datenbank
  password: process.env.DB_PASSWORD, // Dein Passwort
  port: process.env.DB_PORT, // Standardport für PostgreSQL
});

async function seedExpenses(user_id, count) {
  for (let i = 0; i < count; i++) {
    let random_number = Math.random() * 100;

    let randomAmount = 0.0;
    let categoryId;
    let product;

    const ex_entertainment = ["cinema", "concert", "opera", "beach party"];

    const ex_transport = ["Train", "Uber ride", "Metro Ticket", "Bus"];

    const ex_rent = [
      "Surcharge",
      "Electricity addtional payment",
      "Water higher consumption",
      "heating maintenance",
    ];

    const now = new Date();
    const endDate = now.toString();
    const startDate = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1);

    if (random_number < 60) {
      categoryId = 1; // shopping
      randomAmount = parseFloat(faker.finance.amount({ min: 2, max: 10 }));
      product = faker.food.ingredient();
    } else {
      if (random_number < 70) {
        // 60< random_number<70
        categoryId = 2; // Entertainment
        randomAmount = parseFloat(faker.finance.amount({ min: 5, max: 20 }));
        product =
          ex_entertainment[Math.floor(Math.random() * ex_entertainment.length)];
        if (product == "concert") {
          product = faker.music.artist() + " " + product;
        }
      } else {
        if (random_number < 80) {
          // 70< random <80   10%
          categoryId = 3; // Transport
          randomAmount = parseFloat(faker.finance.amount({ min: 1, max: 10 }));
          product =
            ex_transport[Math.floor(Math.random() * ex_transport.length)];
          product = product + " to " + faker.location.city();
        } else {
          if (random_number < 85) {
            //5%
            categoryId = 4; // Rent&Energy
            randomAmount = parseFloat(
              faker.finance.amount({ min: 50, max: 100 })
            );
            product = ex_rent[Math.floor(Math.random() * ex_rent.length)];
          } else {
            categoryId = 5; // Other  15%
            randomAmount = parseFloat(
              faker.finance.amount({ min: 10, max: 50 })
            );
            product = faker.commerce.productName();
          }
        }
      }
    }
    // trdate = trsansaction date
    let trdate = faker.date.between({ from: startDate, to: endDate });

    console.log(
      `Cat.: ${categoryId} Amnt.: ${randomAmount}, prod: ${product}, date: ${trdate} for user ${user_id}`
    );

    try {
      const result = await pool.query(
        `INSERT INTO "expenses" (user_id, category_id, amount, name, date)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [user_id, categoryId, randomAmount, product, trdate]
      );
    } catch (err) {
      console.error("Fehler beim Einfügen der Ausgabe:", err);
    }
  } // for

  await pool.end();
}

seedExpenses(1, 500); // use with user_id and number of items
