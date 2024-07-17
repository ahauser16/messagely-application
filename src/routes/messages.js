// src/routes/messages.js
const express = require('express');
const router = express.Router();
const {ensureLoggedIn} = require('../middleware/auth');
const ExpressError = require("../middleware/expressError");
const Message = require('../models/message');


/** GET /:id - get detail of message.
 * => {message: 
        {id, body, sent_at, read_at, 
            from_user: {username, first_name, last_name, phone},
            to_user: {username, first_name, last_name, phone}
        }
 * Make sure that the currently-logged-in users is either the to or from user.
 **/
router.get('/:id', ensureLoggedIn, async (req, res, next) => {
    try {
        const message = await Message.get(req.params.id);

        // Check if the logged-in user is part of the message (either sender or receiver)
        if (req.user.username !== message.from_user.username && req.user.username !== message.to_user.username) {
            throw new ExpressError("Unauthorized", 401);
        }

        return res.json({ message });
    } catch (err) {
        return next(err);
    }
});



/** POST / - post message.
 * {to_username, body} =>
 * {message: 
 *      {id, from_username, to_username, body, sent_at}
 * }
 **/
router.post('/', ensureLoggedIn, async (req, res, next) => {
    try {
        const { to_username, body } = req.body;
        // Assuming req.user.username contains the username of the currently logged-in user
        const from_username = req.user.username;

        const message = await Message.create({ from_username, to_username, body });

        return res.json({ message });
    } catch (err) {
        return next(err);
    }
});
// ChiefTestUserDontDelete
// WifeOfChiefTester
router.post('/:id/read', ensureLoggedIn, async (req, res, next) => {
    try {
        const messageId = req.params.id;
        const message = await Message.get(messageId);

        // Ensure that only the intended recipient can mark the message as read
        if (req.user.username !== message.to_user.username) {
            throw new ExpressError("Unauthorized", 401);
        }

        const readMessage = await Message.markRead(messageId);

        return res.json({ message: readMessage });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
