const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { validateFeature } = require('../middleware/validation');

// Get all features with vote counts
router.get('/', (req, res) => {
  const userId = req.query.userId ? parseInt(req.query.userId) : null;

  try {
    const query = `
      SELECT
        f.id,
        f.title,
        f.description,
        f.user_id,
        u.username,
        f.created_at,
        f.updated_at,
        (SELECT COUNT(*) FROM votes WHERE feature_id = f.id AND vote_type = 'like') as likes,
        (SELECT COUNT(*) FROM votes WHERE feature_id = f.id AND vote_type = 'dislike') as dislikes,
        ${userId ? `(SELECT vote_type FROM votes WHERE feature_id = f.id AND user_id = ${userId}) as user_vote` : 'NULL as user_vote'}
      FROM features f
      JOIN users u ON f.user_id = u.id
      ORDER BY (likes - dislikes) DESC, f.created_at DESC
    `;

    const features = db.prepare(query).all();
    res.json(features);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Get single feature by ID
router.get('/:id', (req, res) => {
  const featureId = parseInt(req.params.id);
  const userId = req.query.userId ? parseInt(req.query.userId) : null;

  try {
    const query = `
      SELECT
        f.id,
        f.title,
        f.description,
        f.user_id,
        u.username,
        f.created_at,
        f.updated_at,
        (SELECT COUNT(*) FROM votes WHERE feature_id = f.id AND vote_type = 'like') as likes,
        (SELECT COUNT(*) FROM votes WHERE feature_id = f.id AND vote_type = 'dislike') as dislikes,
        ${userId ? `(SELECT vote_type FROM votes WHERE feature_id = f.id AND user_id = ${userId}) as user_vote` : 'NULL as user_vote'}
      FROM features f
      JOIN users u ON f.user_id = u.id
      WHERE f.id = ?
    `;

    const feature = db.prepare(query).get(featureId);

    if (!feature) {
      return res.status(404).json({ error: 'Feature not found' });
    }

    res.json(feature);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Create new feature
router.post('/', validateFeature, (req, res) => {
  const { title, description, userId } = req.body;

  try {
    // Verify user exists
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create feature
    const insert = db.prepare('INSERT INTO features (title, description, user_id) VALUES (?, ?, ?)');
    const result = insert.run(title, description, userId);

    // Return the created feature
    const feature = db.prepare(`
      SELECT f.*, u.username FROM features f
      JOIN users u ON f.user_id = u.id
      WHERE f.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(feature);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Update feature
router.put('/:id', validateFeature, (req, res) => {
  const featureId = parseInt(req.params.id);
  const { title, description, userId } = req.body;

  try {
    // Check if feature exists and belongs to user
    const feature = db.prepare('SELECT user_id FROM features WHERE id = ?').get(featureId);

    if (!feature) {
      return res.status(404).json({ error: 'Feature not found' });
    }

    if (feature.user_id !== userId) {
      return res.status(403).json({ error: 'You can only edit your own features' });
    }

    // Update feature
    db.prepare('UPDATE features SET title = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(title, description, featureId);

    // Return updated feature
    const updatedFeature = db.prepare(`
      SELECT f.*, u.username FROM features f
      JOIN users u ON f.user_id = u.id
      WHERE f.id = ?
    `).get(featureId);

    res.json(updatedFeature);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Delete feature
router.delete('/:id', (req, res) => {
  const featureId = parseInt(req.params.id);
  const userId = parseInt(req.query.userId);

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    // Check if feature exists and belongs to user
    const feature = db.prepare('SELECT user_id FROM features WHERE id = ?').get(featureId);

    if (!feature) {
      return res.status(404).json({ error: 'Feature not found' });
    }

    if (feature.user_id !== userId) {
      return res.status(403).json({ error: 'You can only delete your own features' });
    }

    // Delete feature (votes will be cascade deleted)
    db.prepare('DELETE FROM features WHERE id = ?').run(featureId);

    res.json({ message: 'Feature deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router;
