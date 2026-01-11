const { validateUsername, validateFeature, validateVote } = require('../../src/middleware/validation');

describe('Validation Middleware', () => {
  describe('validateUsername', () => {
    let req, res, next;

    beforeEach(() => {
      req = { body: {} };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      next = jest.fn();
    });

    test('should pass validation with valid username', () => {
      req.body.username = 'validuser';

      validateUsername(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should trim whitespace from username', () => {
      req.body.username = '  validuser  ';

      validateUsername(req, res, next);

      expect(req.body.username).toBe('validuser');
      expect(next).toHaveBeenCalled();
    });

    test('should return 400 for empty username', () => {
      req.body.username = '';

      validateUsername(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Username is required and must be a non-empty string'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 400 for whitespace-only username', () => {
      req.body.username = '   ';

      validateUsername(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Username is required and must be a non-empty string'
      });
    });

    test('should return 400 for non-string username', () => {
      req.body.username = 123;

      validateUsername(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Username is required and must be a non-empty string'
      });
    });

    test('should return 400 for null username', () => {
      req.body.username = null;

      validateUsername(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should return 400 for undefined username', () => {
      // username not in body

      validateUsername(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should return 400 for username over 50 characters', () => {
      req.body.username = 'a'.repeat(51);

      validateUsername(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Username must be 50 characters or less'
      });
    });

    test('should pass for username exactly 50 characters', () => {
      req.body.username = 'a'.repeat(50);

      validateUsername(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('validateFeature', () => {
    let req, res, next;

    beforeEach(() => {
      req = { body: {} };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      next = jest.fn();
    });

    test('should pass validation with valid feature data', () => {
      req.body = {
        title: 'Valid Title',
        description: 'Valid description',
        userId: 1
      };

      validateFeature(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should trim whitespace from title and description', () => {
      req.body = {
        title: '  Valid Title  ',
        description: '  Valid description  ',
        userId: 1
      };

      validateFeature(req, res, next);

      expect(req.body.title).toBe('Valid Title');
      expect(req.body.description).toBe('Valid description');
      expect(next).toHaveBeenCalled();
    });

    test('should return 400 for empty title', () => {
      req.body = {
        title: '',
        description: 'Valid description',
        userId: 1
      };

      validateFeature(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Title is required and must be a non-empty string'
      });
    });

    test('should return 400 for empty description', () => {
      req.body = {
        title: 'Valid Title',
        description: '',
        userId: 1
      };

      validateFeature(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Description is required and must be a non-empty string'
      });
    });

    test('should return 400 for missing userId', () => {
      req.body = {
        title: 'Valid Title',
        description: 'Valid description'
      };

      validateFeature(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'userId is required and must be a number'
      });
    });

    test('should return 400 for non-number userId', () => {
      req.body = {
        title: 'Valid Title',
        description: 'Valid description',
        userId: '1'
      };

      validateFeature(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'userId is required and must be a number'
      });
    });

    test('should return 400 for title over 200 characters', () => {
      req.body = {
        title: 'a'.repeat(201),
        description: 'Valid description',
        userId: 1
      };

      validateFeature(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Title must be 200 characters or less'
      });
    });

    test('should return 400 for description over 2000 characters', () => {
      req.body = {
        title: 'Valid Title',
        description: 'a'.repeat(2001),
        userId: 1
      };

      validateFeature(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Description must be 2000 characters or less'
      });
    });

    test('should pass for title exactly 200 characters', () => {
      req.body = {
        title: 'a'.repeat(200),
        description: 'Valid description',
        userId: 1
      };

      validateFeature(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('should pass for description exactly 2000 characters', () => {
      req.body = {
        title: 'Valid Title',
        description: 'a'.repeat(2000),
        userId: 1
      };

      validateFeature(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('validateVote', () => {
    let req, res, next;

    beforeEach(() => {
      req = { body: {} };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      next = jest.fn();
    });

    test('should pass validation with valid vote data (like)', () => {
      req.body = {
        featureId: 1,
        userId: 1,
        voteType: 'like'
      };

      validateVote(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should pass validation with valid vote data (dislike)', () => {
      req.body = {
        featureId: 1,
        userId: 1,
        voteType: 'dislike'
      };

      validateVote(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('should return 400 for invalid voteType', () => {
      req.body = {
        featureId: 1,
        userId: 1,
        voteType: 'invalid'
      };

      validateVote(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'voteType is required and must be either "like" or "dislike"'
      });
    });

    test('should return 400 for missing featureId', () => {
      req.body = {
        userId: 1,
        voteType: 'like'
      };

      validateVote(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'featureId is required and must be a number'
      });
    });

    test('should return 400 for missing userId', () => {
      req.body = {
        featureId: 1,
        voteType: 'like'
      };

      validateVote(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'userId is required and must be a number'
      });
    });

    test('should return 400 for non-number featureId', () => {
      req.body = {
        featureId: '1',
        userId: 1,
        voteType: 'like'
      };

      validateVote(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'featureId is required and must be a number'
      });
    });

    test('should return 400 for non-number userId', () => {
      req.body = {
        featureId: 1,
        userId: '1',
        voteType: 'like'
      };

      validateVote(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'userId is required and must be a number'
      });
    });

    test('should return 400 for missing voteType', () => {
      req.body = {
        featureId: 1,
        userId: 1
      };

      validateVote(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'voteType is required and must be either "like" or "dislike"'
      });
    });
  });
});
