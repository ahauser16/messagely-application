// models/user.js
const db = require('../db');
const bcrypt = require('bcrypt');
const { BCRYPT_WORK_FACTOR } = require('../config');
const ExpressError = require('../expressError');

/** User of the site. */
class User {
  /* This method hashes the user's password using bcrypt and inserts the new user into the database. It returns the newly created user's details. */
  static async register({ username, password, first_name, last_name, phone }) {
    let hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
       VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
       RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone]
    );
    return result.rows[0];
  }

  /* This method checks if the provided username and password match a user in the database. It returns true if the credentials are valid, otherwise false. */
  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT password FROM users WHERE username = $1`,
      [username]
    );
    let user = result.rows[0];

    return user && await bcrypt.compare(password, user.password);
  }

  /* This method updates the last_login_at timestamp for the specified user. If the user is not found, it throws an error. */
  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `UPDATE users 
       SET last_login_at = current_timestamp 
       WHERE username = $1
       RETURNING username`,
      [username]
    );
    if (!result.rows[0]) {
      throw new ExpressError(`No such user: ${username}`, 404);
    }
  }

  /* This method retrieves basic information for all users in the database in the format: [{username, first_name, last_name, phone}, ...] */
  static async all() {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone FROM users`
    );
    return result.rows;
  }

  // This method retrieves detailed information for a specific user by username. If the user is not found, it throws an error.
  static async get(username) {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at
       FROM users
       WHERE username = $1`,
      [username]
    );
    if (!result.rows[0]) {
      throw new ExpressError(`No such user: ${username}`, 404);
    }
    return result.rows[0];
  }

  /** Return messages from this user. [{id, to_user, body, sent_at, read_at}]. where to_user is {username, first_name, last_name, phone} */
  /** This method retrieves all messages sent by the specified user. It includes the following details about the recipient of each message: {username, first_name, last_name, phone, join_at,last_login_at }.  If no messages are found, it throws an error. */
  static async messagesFrom(username) {
    //Database Query: The method executes a SQL query to select messages from the `messages` table where the `from_username` matches the provided `username`. It joins the `messages` table with the `users` table to get details about the recipient (`to_user`).
    const result = await db.query(
      `SELECT m.id,
              m.to_username,
              u.first_name,
              u.last_name,
              u.phone,
              m.body,
              m.sent_at,
              m.read_at
       FROM messages AS m
       JOIN users AS u ON m.to_username = u.username
       WHERE from_username = $1`,
      [username]
    );
    //Error Handling: If no messages are found (i.e., `result.rows.length === 0`), the method throws an `ExpressError` indicating that there are no messages from the specified user.
    if (result.rows.length === 0) {
      throw new ExpressError(`No messages from user: ${username}`, 404);
    }
    //Mapping Results: The method maps the result rows to a specific format. Each message includes the message details (`id`, `body`, `sent_at`, `read_at`) and the recipient details (`to_user`).
    return result.rows.map(row => ({
      id: m.id,
      to_user: {
        username: m.to_username,
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at
    }));
  }

  /** Return messages to this user. [{id, from_user, body, sent_at, read_at}]. where from_user is {username, first_name, last_name, phone} */
  //This method retrieves all messages sent to the specified user. It includes details about the sender of each message. If no messages are found, it throws an error.
  static async messagesTo(username) {
    const result = await db.query(
      `SELECT m.id,
                m.from_username,
                u.first_name,
                u.last_name,
                u.phone,
                m.body,
                m.sent_at,
                m.read_at
          FROM messages AS m
           JOIN users AS u ON m.from_username = u.username
          WHERE to_username = $1`,
      [username]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`No messages to user: ${username}`, 404);
    }
    return result.rows.map(m => ({
      id: m.id,
      from_user: {
        username: m.from_username,
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone,
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at
    }));
  }
}


module.exports = User;