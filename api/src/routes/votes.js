const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { validateVote } = require('../middleware/validation');

// Create or update vote
router.post('/', validateVote, (req, res) => {
  const { featureId, userId, voteType } = req.body;

  try {
    // Check if feature exists
    const feature = db.prepare('SELECT id FROM features WHERE id = ?').get(featureId);

    if (!feature) {
      return res.status(404).json({ error: 'Feature not found' });
    }

    // Check if user exists
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if vote already exists
    const existingVote = db.prepare('SELECT id, vote_type FROM votes WHERE feature_id = ? AND user_id = ?')
      .get(featureId, userId);

    if (existingVote) {
      // Update existing vote
      db.prepare('UPDATE votes SET vote_type = ? WHERE feature_id = ? AND user_id = ?')
        .run(voteType, featureId, userId);

      return res.json({
        id: existingVote.id,
        featureId,
        userId,
        voteType
      });
    } else {
      // Create new vote
      const insert = db.prepare('INSERT INTO votes (feature_id, user_id, vote_type) VALUES (?, ?, ?)');
      const result = insert.run(featureId, userId, voteType);

      return res.status(201).json({
        id: result.lastInsertRowid,
        featureId,
        userId,
        voteType
      });
    }
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Delete vote
router.delete('/', (req, res) => {
  const featureId = parseInt(req.query.featureId);
  const userId = parseInt(req.query.userId);

  if (!featureId || !userId) {
    return res.status(400).json({ error: 'featureId and userId are required' });
  }

  try {
    const result = db.prepare('DELETE FROM votes WHERE feature_id = ? AND user_id = ?')
      .run(featureId, userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Vote not found' });
    }

    res.json({ message: 'Vote deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router;
