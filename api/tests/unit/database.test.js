const { initTestDatabase, clearDatabase, closeTestDatabase } = require('../setup/testDb');
const { createTestUser, createTestFeature, createTestVote } = require('../setup/testHelpers');

describe('Database Operations', () => {
  let db;

  beforeAll(() => {
    db = initTestDatabase();
  });

  afterEach(() => {
    clearDatabase();
  });

  afterAll(() => {
    closeTestDatabase();
  });

  describe('Database Initialization', () => {
    test('should establish database connection', () => {
      expect(db).toBeDefined();
      expect(typeof db.prepare).toBe('function');
    });

    test('should create users table', () => {
      const result = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
      expect(result).toBeDefined();
      expect(result.name).toBe('users');
    });

    test('should create features table', () => {
      const result = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='features'").get();
      expect(result).toBeDefined();
      expect(result.name).toBe('features');
    });

    test('should create votes table', () => {
      const result = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='votes'").get();
      expect(result).toBeDefined();
      expect(result.name).toBe('votes');
    });
  });

  describe('Foreign Key Constraints', () => {
    test('should enforce foreign key constraint on features.user_id', () => {
      expect(() => {
        db.prepare('INSERT INTO features (title, description, user_id) VALUES (?, ?, ?)').run(
          'Test Feature',
          'Test Description',
          999 // Non-existent user
        );
      }).toThrow();
    });

    test('should enforce foreign key constraint on votes.feature_id', () => {
      const user = createTestUser();

      expect(() => {
        db.prepare('INSERT INTO votes (feature_id, user_id, vote_type) VALUES (?, ?, ?)').run(
          999, // Non-existent feature
          user.id,
          'like'
        );
      }).toThrow();
    });

    test('should enforce foreign key constraint on votes.user_id', () => {
      const user = createTestUser();
      const feature = createTestFeature('Test', 'Description', user.id);

      expect(() => {
        db.prepare('INSERT INTO votes (feature_id, user_id, vote_type) VALUES (?, ?, ?)').run(
          feature.id,
          999, // Non-existent user
          'like'
        );
      }).toThrow();
    });

    test('should cascade delete votes when feature is deleted', () => {
      const user = createTestUser();
      const feature = createTestFeature('Test', 'Description', user.id);
      createTestVote(feature.id, user.id, 'like');

      // Verify vote exists
      let votes = db.prepare('SELECT * FROM votes WHERE feature_id = ?').all(feature.id);
      expect(votes.length).toBe(1);

      // Delete feature
      db.prepare('DELETE FROM features WHERE id = ?').run(feature.id);

      // Verify votes are cascade deleted
      votes = db.prepare('SELECT * FROM votes WHERE feature_id = ?').all(feature.id);
      expect(votes.length).toBe(0);
    });
  });

  describe('Unique Constraints', () => {
    test('should enforce unique constraint on username', () => {
      createTestUser('uniqueuser');

      expect(() => {
        createTestUser('uniqueuser');
      }).toThrow();
    });

    test('should enforce unique constraint on vote (feature_id, user_id)', () => {
      const user = createTestUser();
      const feature = createTestFeature('Test', 'Description', user.id);

      // First vote should succeed
      createTestVote(feature.id, user.id, 'like');

      // Second vote with same feature_id and user_id should fail
      expect(() => {
        db.prepare('INSERT INTO votes (feature_id, user_id, vote_type) VALUES (?, ?, ?)').run(
          feature.id,
          user.id,
          'dislike'
        );
      }).toThrow();
    });

    test('should allow different users to vote on same feature', () => {
      const user1 = createTestUser('user1');
      const user2 = createTestUser('user2');
      const feature = createTestFeature('Test', 'Description', user1.id);

      // Both votes should succeed
      const vote1 = createTestVote(feature.id, user1.id, 'like');
      const vote2 = createTestVote(feature.id, user2.id, 'dislike');

      expect(vote1.id).toBeDefined();
      expect(vote2.id).toBeDefined();
      expect(vote1.id).not.toBe(vote2.id);
    });

    test('should allow same user to vote on different features', () => {
      const user = createTestUser();
      const feature1 = createTestFeature('Feature 1', 'Description 1', user.id);
      const feature2 = createTestFeature('Feature 2', 'Description 2', user.id);

      // Both votes should succeed
      const vote1 = createTestVote(feature1.id, user.id, 'like');
      const vote2 = createTestVote(feature2.id, user.id, 'dislike');

      expect(vote1.id).toBeDefined();
      expect(vote2.id).toBeDefined();
    });
  });

  describe('Vote Type Constraint', () => {
    test('should accept "like" as voteType', () => {
      const user = createTestUser();
      const feature = createTestFeature('Test', 'Description', user.id);

      const vote = createTestVote(feature.id, user.id, 'like');
      expect(vote.voteType).toBe('like');
    });

    test('should accept "dislike" as voteType', () => {
      const user = createTestUser();
      const feature = createTestFeature('Test', 'Description', user.id);

      const vote = createTestVote(feature.id, user.id, 'dislike');
      expect(vote.voteType).toBe('dislike');
    });

    test('should reject invalid voteType', () => {
      const user = createTestUser();
      const feature = createTestFeature('Test', 'Description', user.id);

      expect(() => {
        db.prepare('INSERT INTO votes (feature_id, user_id, vote_type) VALUES (?, ?, ?)').run(
          feature.id,
          user.id,
          'invalid'
        );
      }).toThrow();
    });
  });

  describe('Auto-increment and Timestamps', () => {
    test('should auto-increment user IDs', () => {
      const user1 = createTestUser('user1');
      const user2 = createTestUser('user2');

      expect(user2.id).toBe(user1.id + 1);
    });

    test('should auto-increment feature IDs', () => {
      const user = createTestUser();
      const feature1 = createTestFeature('Feature 1', 'Desc 1', user.id);
      const feature2 = createTestFeature('Feature 2', 'Desc 2', user.id);

      expect(feature2.id).toBe(feature1.id + 1);
    });

    test('should set created_at timestamp for users', () => {
      const user = createTestUser();
      const dbUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);

      expect(dbUser.created_at).toBeDefined();
      expect(typeof dbUser.created_at).toBe('string');
    });

    test('should set created_at and updated_at timestamps for features', () => {
      const user = createTestUser();
      const feature = createTestFeature('Test', 'Description', user.id);

      expect(feature.created_at).toBeDefined();
      expect(feature.updated_at).toBeDefined();
      expect(typeof feature.created_at).toBe('string');
      expect(typeof feature.updated_at).toBe('string');
    });
  });
});
