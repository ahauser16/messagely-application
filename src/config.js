//src/config.js
// read .env files and make environmental variables
require("dotenv").config();

const DB_URI = (process.env.NODE_ENV === "test")
  ? "postgresql://haus:Laylacharlie22!@localhost:5432/messagely_test"
  : "postgresql://haus:Laylacharlie22!@localhost:5432/messagely";

// const DB_URI = (process.env.NODE_ENV === "test")
//   ? "postgresql:///messagely_test"
//   : "postgresql:///messagely";

const SECRET_KEY = process.env.SECRET_KEY || "secret";

const BCRYPT_WORK_FACTOR = 12;

module.exports = {
  DB_URI,
  SECRET_KEY,
  BCRYPT_WORK_FACTOR,
};