const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { validateUsername } = require('../middleware/validation');

// Create or retrieve user by username
router.post('/', validateUsername, (req, res) => {
  const { username } = req.body;

  try {
    // First, try to find existing user
    const user = db.prepare('SELECT id, username FROM users WHERE username = ?').get(username);

    if (user) {
      // User exists, return it
      return res.json(user);
    }

    // User doesn't exist, create new one
    const insert = db.prepare('INSERT INTO users (username) VALUES (?)');
    const result = insert.run(username);

    res.status(201).json({
      id: result.lastInsertRowid,
      username: username
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router;
