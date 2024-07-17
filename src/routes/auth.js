// src/routes/auth.js
const express = require('express');
const router = express.Router();
const ExpressError = require("../middleware/expressError");
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');
const User = require('../models/user');

router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            throw new ExpressError("Username and password required", 400);
        }

        const user = await User.authenticate(username, password);
        if (user) {
            const token = jwt.sign({ username }, SECRET_KEY);
            await User.updateLoginTimestamp(username); // Assuming this method exists and updates the last_login_at field
            return res.json({ token });
        } else {
            throw new ExpressError("Invalid username/password", 400);
        }
    } catch (err) {
        return next(err);
    }
});

// src/routes/auth.js
router.post('/register', async (req, res, next) => {
    try {
        const { username, password, first_name, last_name, phone } = req.body;
        if (!username || !password || !first_name || !last_name || !phone) {
            throw new ExpressError("All fields are required", 400);
        }

        // Try to get the user to check if they already exist
        try {
            await User.get(username);
            // If the user is found, throw an error because they already exist
            throw new ExpressError("User already exists", 400);
        } catch (err) {
            // If an error is caught, check if it's because the user was not found
            if (err.status === 404) {
                // If the user does not exist, proceed with registration
                const newUser = await User.register({ username, password, first_name, last_name, phone });
                if (newUser) {
                    await User.updateLoginTimestamp(username); // Updates the last_login_at field
                    const token = jwt.sign({ username }, SECRET_KEY);
                    return res.json({ token });
                } else {
                    throw new ExpressError("Error registering user", 400);
                }
            } else {
                // If the error is not a 404, rethrow it
                throw err;
            }
        }
    } catch (err) {
        return next(err);
    }
});

module.exports = router;