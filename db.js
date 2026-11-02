const { MongoClient } = require("mongodb");

let client;
let db;

async function connectDB() {
  if (db) return db;
  client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db(process.env.DB_NAME);
  return db;
}

async function generateRegistrationNumber(accountType, db) {
  const year = new Date().getFullYear();
  const prefixMap = {
    undergraduate: "IIUC-STU",
    Undergraduate: "IIUC-STU",
    Alumni: "IIUC-ALU",
    Graduate: "IIUC-ALU",
    faculty: "IIUC-FAC",
    Faculty: "IIUC-FAC",
  };
  const prefix = prefixMap[accountType] || "IIUC-STU";
  const counter = db.collection("registrationCounters");

  const result = await counter.findOneAndUpdate(
    { _id: `${prefix}-${year}` },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );

  const seq = result.seq;
  const padded = String(seq).padStart(4, "0");
  return `${prefix}-${year}-${padded}`;
}

module.exports = { connectDB, generateRegistrationNumber };

