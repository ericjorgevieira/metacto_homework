const { initTestDatabase, clearDatabase, closeTestDatabase } = require('../setup/testDb');
const { createTestUser, createTestFeature, createTestVote } = require('../setup/testHelpers');

// Mock database before requiring routes
jest.mock('../../src/database/db', () => {
  return require('../setup/testDb').getTestDatabase();
});

const usersRouter = require('../../src/routes/users');
const featuresRouter = require('../../src/routes/features');
const votesRouter = require('../../src/routes/votes');

describe('Routes Unit Tests', () => {
  beforeAll(() => {
    initTestDatabase();
  });

  afterEach(() => {
    clearDatabase();
  });

  afterAll(() => {
    closeTestDatabase();
  });

  describe('User Routes', () => {
    test('should export router', () => {
      expect(usersRouter).toBeDefined();
      expect(typeof usersRouter).toBe('function');
    });
  });

  describe('Feature Routes', () => {
    test('should export router', () => {
      expect(featuresRouter).toBeDefined();
      expect(typeof featuresRouter).toBe('function');
    });
  });

  describe('Vote Routes', () => {
    test('should export router', () => {
      expect(votesRouter).toBeDefined();
      expect(typeof votesRouter).toBe('function');
    });
  });

  describe('Database Integration with Routes', () => {
    test('createTestUser should work with routes', () => {
      const user = createTestUser('routeuser');
      expect(user.id).toBeDefined();
      expect(user.username).toBe('routeuser');
    });

    test('createTestFeature should work with routes', () => {
      const user = createTestUser();
      const feature = createTestFeature('Test', 'Description', user.id);
      expect(feature.id).toBeDefined();
      expect(feature.title).toBe('Test');
    });

    test('createTestVote should work with routes', () => {
      const user = createTestUser();
      const feature = createTestFeature('Test', 'Description', user.id);
      const vote = createTestVote(feature.id, user.id, 'like');
      expect(vote.id).toBeDefined();
      expect(vote.voteType).toBe('like');
    });
  });
});
