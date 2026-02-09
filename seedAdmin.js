require("dotenv").config();

const knexConfig = require("./knexfile");
const knex = require("knex")(knexConfig["development"]);
const bcrypt = require("bcryptjs");

async function seedAdmin() {
  try {
    const existing = await knex("users")
      .where({ email: "admin@example.com" })
      .first();

    if (existing) {
      console.log("Admin already exists.");
      process.exit(0);
    }

    const hashed = await bcrypt.hash("Password123", 10);

    await knex("users").insert({
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      password: hashed,
      roleId: 1,
      createdAt: knex.fn.now(),
      updatedAt: knex.fn.now(),
    });

    console.log("Admin user created: admin@example.com / Password123");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seedAdmin();
