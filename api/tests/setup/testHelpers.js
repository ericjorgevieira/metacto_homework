const { getTestDatabase } = require('./testDb');

// Helper to create a test user
const createTestUser = (username = 'testuser') => {
  const db = getTestDatabase();
  const insert = db.prepare('INSERT INTO users (username) VALUES (?)');
  const result = insert.run(username);

  return {
    id: result.lastInsertRowid,
    username: username
  };
};

// Helper to create a test feature
const createTestFeature = (title, description, userId) => {
  const db = getTestDatabase();
  const insert = db.prepare('INSERT INTO features (title, description, user_id) VALUES (?, ?, ?)');
  const result = insert.run(title, description, userId);

  const feature = db.prepare(`
    SELECT f.*, u.username FROM features f
    JOIN users u ON f.user_id = u.id
    WHERE f.id = ?
  `).get(result.lastInsertRowid);

  return feature;
};

// Helper to create a test vote
const createTestVote = (featureId, userId, voteType) => {
  const db = getTestDatabase();
  const insert = db.prepare('INSERT INTO votes (feature_id, user_id, vote_type) VALUES (?, ?, ?)');
  const result = insert.run(featureId, userId, voteType);

  return {
    id: result.lastInsertRowid,
    featureId,
    userId,
    voteType
  };
};

// Helper to get all users
const getAllUsers = () => {
  const db = getTestDatabase();
  return db.prepare('SELECT * FROM users').all();
};

// Helper to get all features
const getAllFeatures = () => {
  const db = getTestDatabase();
  return db.prepare('SELECT * FROM features').all();
};

// Helper to get all votes
const getAllVotes = () => {
  const db = getTestDatabase();
  return db.prepare('SELECT * FROM votes').all();
};

module.exports = {
  createTestUser,
  createTestFeature,
  createTestVote,
  getAllUsers,
  getAllFeatures,
  getAllVotes
};
