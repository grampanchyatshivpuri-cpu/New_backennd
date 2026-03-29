require("dotenv").config();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

async function createAdmin() {
  try {
    console.log("Creating admin user...");

    const email = process.env.ADMIN_EMAIL || "admin@grampanchayat.gov.in";
    const password = process.env.ADMIN_PASSWORD || "admin123";

    // Check if admin already exists
    const existingAdmin = await User.findByEmail(email);
    if (existingAdmin) {
      console.log("❌ Admin user already exists with email:", email);
      process.exit(1);
    }

    // Create admin user (User.create will hash the password)
    const admin = await User.create(email, password, "admin");

    console.log("✅ Admin user created successfully!");
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("\n⚠️  Please change the password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
    console.error(error);
    process.exit(1);
  }
}

createAdmin();
