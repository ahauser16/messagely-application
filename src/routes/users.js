// src/routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const db = require('../db/db');
const ExpressError = require("../middleware/expressError");


/** 
 * GET / - get list of users.
 * => {users: [{username, first_name, last_name, phone}, ...]}
 **/
router.get('/', async (req, res, next) => {
    try {
        const result = await db.query(
            `SELECT username, first_name, last_name, phone FROM users`
        );
        return res.json({ users: result.rows });
    } catch (err) {
        return next(err);
    }
});


/** 
 * GET /:username - get detail of users.
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 **/
router.get('/:username', async (req, res, next) => {
    try {
        const username = req.params.username;
        const user = await User.get(username);
        if (!user) {
            throw new ExpressError("User not found", 404);
        }
        return res.json({ user });
    } catch (err) {
        return next(err);
    }
});


/** 
 * GET /:username/to - get messages to user
 * => {messages: [{id, body, sent_at, read_at, from_user: {username, first_name, last_name, phone}}, ...]}
 **/
router.get('/:username/to', async (req, res, next) => {
    try {
        const username = req.params.username;
        const messages = await User.messagesTo(username);
        return res.json({ messages });
    } catch (err) {
        return next(err);
    }
});


/** 
 * GET /:username/from - get messages from user
 * => {messages: [{id, body, sent_at, read_at, to_user: {username, first_name, last_name, phone}}, ...]}
 **/
router.get('/:username/from', async (req, res, next) => {
    try {
      const username = req.params.username;
      const messages = await User.messagesFrom(username);
      return res.json({ messages });
    } catch (err) {
      return next(err);
    }
  });

module.exports = router;
