const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { connectDB, generateRegistrationNumber } = require("./db");
const { generateAdminToken, verifyAdminToken } = require("./adminAuth");
const { sendRegistrationEmail } = require("./mailer");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "IIUC Connect Backend Running" });
});

// ──────────────────────────────────────────
// ADMIN SIGN IN  →  returns JWT
// ──────────────────────────────────────────
app.post("/api/admin/signin", (req, res) => {
  const { email, password } = req.body;
  if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Invalid admin credentials" });
  }
  const token = generateAdminToken();
  res.json({
    token,
    admin: {
      email: process.env.ADMIN_EMAIL,
      role: "admin",
      registrationNumber: "IIUC-admin-2026-1526",
    },
  });
});

// ──────────────────────────────────────────
// REGISTER USER  →  generate regNo + email
// Called from Next.js after Better Auth signs up user
// ──────────────────────────────────────────
app.post("/api/auth/register-complete", async (req, res) => {
  try {
    const db = await connectDB();
    const { userId, name, email, accountType, department, batch, currentSemester, designation, graduationYear, agreeTerms } = req.body;

    const regNumber = await generateRegistrationNumber(accountType, db);

    await db.collection("userProfiles").insertOne({
      userId,
      name,
      email,
      accountType,
      department,
      batch: batch || null,
      currentSemester: currentSemester || null,
      designation: designation || null,
      graduationYear: graduationYear || null,
      agreeTerms,
      registrationNumber: regNumber,
      createdAt: new Date(),
    });

    await sendRegistrationEmail(email, name, regNumber);

    res.json({ success: true, registrationNumber: regNumber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration completion failed", error: err.message });
  }
});

// ──────────────────────────────────────────
// ADMIN-ONLY: GET ALL USERS
// ──────────────────────────────────────────
app.get("/api/admin/users", verifyAdminToken, async (req, res) => {
  try {
    const db = await connectDB();
    const users = await db.collection("userProfiles").find({}).toArray();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// ──────────────────────────────────────────
// ADMIN-ONLY: DELETE USER
// ──────────────────────────────────────────
app.delete("/api/admin/users/:userId", verifyAdminToken, async (req, res) => {
  try {
    const db = await connectDB();
    await db.collection("userProfiles").deleteOne({ userId: req.params.userId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

// Career-hub related endpoints can be added here in the future

app.get("/api/career-hub" , async(req, res) => {  
  try {
    const db = await connectDB();
    const careerHubData = await db.collection("career-hub").find({}).toArray();
    res.json(careerHubData);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch career hub data" });
  }
});




app.listen(port, () => {
  console.log(`IIUC Connect backend running on port ${port}`);
});
