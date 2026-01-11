// Validation middleware
const validateUsername = (req, res, next) => {
  const { username } = req.body;

  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    return res.status(400).json({ error: 'Username is required and must be a non-empty string' });
  }

  if (username.length > 50) {
    return res.status(400).json({ error: 'Username must be 50 characters or less' });
  }

  req.body.username = username.trim();
  next();
};

const validateFeature = (req, res, next) => {
  const { title, description, userId } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ error: 'Title is required and must be a non-empty string' });
  }

  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    return res.status(400).json({ error: 'Description is required and must be a non-empty string' });
  }

  if (!userId || typeof userId !== 'number') {
    return res.status(400).json({ error: 'userId is required and must be a number' });
  }

  if (title.length > 200) {
    return res.status(400).json({ error: 'Title must be 200 characters or less' });
  }

  if (description.length > 2000) {
    return res.status(400).json({ error: 'Description must be 2000 characters or less' });
  }

  req.body.title = title.trim();
  req.body.description = description.trim();
  next();
};

const validateVote = (req, res, next) => {
  const { featureId, userId, voteType } = req.body;

  if (!featureId || typeof featureId !== 'number') {
    return res.status(400).json({ error: 'featureId is required and must be a number' });
  }

  if (!userId || typeof userId !== 'number') {
    return res.status(400).json({ error: 'userId is required and must be a number' });
  }

  if (!voteType || !['like', 'dislike'].includes(voteType)) {
    return res.status(400).json({ error: 'voteType is required and must be either "like" or "dislike"' });
  }

  next();
};

module.exports = {
  validateUsername,
  validateFeature,
  validateVote
};
