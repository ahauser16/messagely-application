//src/models/user.js
const db = require("../db/db");
const ExpressError = require("../middleware/expressError");

class User {
  static async register({ username, password, first_name, last_name, phone }) {
    try {
      const join_at = new Date();
      const result = await db.query(
        `INSERT INTO users (
        username, 
        password, 
        first_name, 
        last_name, 
        phone, 
        join_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING username, password, first_name, last_name, phone`,
        [username, password, first_name, last_name, phone, join_at]
      );
      return result.rows[0];
    } catch (err) {
      throw new ExpressError("Error registering user", 400);
    }
  }

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT password 
      FROM users 
      WHERE username = $1`,
      [username]
    );

    if (result.rows.length) {
      const user = result.rows[0];
      if (user.password === password) {
        return true;
      } else {
        throw new ExpressError("Invalid password", 401);
      }
    } else {
      throw new ExpressError("User not found", 404);
    }
  }

  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `UPDATE users 
      SET last_login_at=$1 
      WHERE username=$2
      RETURNING username`,
      [new Date(), username]
    );
    if (result.rows.length === 0) {
      throw new ExpressError("User not found", 404);
    }
  }

  static async get(username) {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at 
      FROM users WHERE username = $1`,
      [username]
    );

    if (result.rows.length) {
      return result.rows[0];
    } else {
      throw new ExpressError("User not found", 404);
    }
  }

  static async messagesFrom(username) {
    const result = await db.query(
      `SELECT m.id, m.body, m.sent_at, m.read_at, 
              u.username, u.first_name, u.last_name, u.phone
       FROM messages m
       JOIN users u ON m.to_username = u.username
       WHERE m.from_username = $1`,
      [username]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`No messages from user: ${username}`, 404);
    }
    return result.rows.map(row => ({
      id: row.id,
      to_user: {
        username: row.username,
        first_name: row.first_name,
        last_name: row.last_name,
        phone: row.phone
      },
      body: row.body,
      sent_at: row.sent_at,
      read_at: row.read_at
    }));
  }

  static async messagesTo(username) {
    const result = await db.query(
      `SELECT m.id, m.body, m.sent_at, m.read_at, 
              u.username, u.first_name, u.last_name, u.phone
       FROM messages m
       JOIN users u ON m.from_username = u.username
       WHERE m.to_username = $1`,
      [username]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`No messages to user: ${username}`, 404);
    }
    return result.rows.map(row => ({
      id: row.id,
      from_user: {
        username: row.username,
        first_name: row.first_name,
        last_name: row.last_name,
        phone: row.phone
      },
      body: row.body,
      sent_at: row.sent_at,
      read_at: row.read_at
    }));
  }
}

module.exports = User;