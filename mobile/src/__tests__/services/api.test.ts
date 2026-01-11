jest.mock('axios');

import axios from 'axios';
import {
  createOrGetUser,
  getFeatures,
  getFeature,
  createFeature,
  updateFeature,
  deleteFeature,
  vote,
  removeVote,
} from '../../services/api';

// Get the mocked instance
const mockAxiosCreate = axios.create as jest.Mock;
const mockInstance = mockAxiosCreate.mock.results[0]?.value || mockAxiosCreate();
const mockGet = mockInstance.get as jest.Mock;
const mockPost = mockInstance.post as jest.Mock;
const mockPut = mockInstance.put as jest.Mock;
const mockDelete = mockInstance.delete as jest.Mock;

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrGetUser', () => {
    test('should make POST request with username', async () => {
      const mockUser = { id: 1, username: 'testuser' };
      mockPost.mockResolvedValueOnce({ data: mockUser });

      const result = await createOrGetUser('testuser');

      expect(mockPost).toHaveBeenCalledWith('/users', { username: 'testuser' });
      expect(result).toEqual(mockUser);
    });
  });

  describe('getFeatures', () => {
    test('should make GET request with userId', async () => {
      const mockFeatures = [
        { id: 1, title: 'Feature 1', likes: 5, dislikes: 2, user_vote: 'like' }
      ];
      mockGet.mockResolvedValueOnce({ data: mockFeatures });

      const result = await getFeatures(1);

      expect(mockGet).toHaveBeenCalledWith('/features?userId=1');
      expect(result).toEqual(mockFeatures);
    });
  });

  describe('getFeature', () => {
    test('should make GET request with id and userId', async () => {
      const mockFeature = { id: 1, title: 'Feature', likes: 5, dislikes: 2 };
      mockGet.mockResolvedValueOnce({ data: mockFeature });

      const result = await getFeature(1, 2);

      expect(mockGet).toHaveBeenCalledWith('/features/1?userId=2');
      expect(result).toEqual(mockFeature);
    });
  });

  describe('createFeature', () => {
    test('should make POST request with feature data', async () => {
      const mockFeature = { id: 1, title: 'New Feature', description: 'Description', user_id: 1 };
      mockPost.mockResolvedValueOnce({ data: mockFeature });

      const result = await createFeature('New Feature', 'Description', 1);

      expect(mockPost).toHaveBeenCalledWith('/features', {
        title: 'New Feature',
        description: 'Description',
        userId: 1
      });
      expect(result).toEqual(mockFeature);
    });
  });

  describe('updateFeature', () => {
    test('should make PUT request with updated data', async () => {
      const mockFeature = { id: 1, title: 'Updated', description: 'Updated desc', user_id: 1 };
      mockPut.mockResolvedValueOnce({ data: mockFeature });

      const result = await updateFeature(1, 'Updated', 'Updated desc', 1);

      expect(mockPut).toHaveBeenCalledWith('/features/1', {
        title: 'Updated',
        description: 'Updated desc',
        userId: 1
      });
      expect(result).toEqual(mockFeature);
    });
  });

  describe('deleteFeature', () => {
    test('should make DELETE request with id and userId', async () => {
      const mockResponse = { message: 'Feature deleted successfully' };
      mockDelete.mockResolvedValueOnce({ data: mockResponse });

      const result = await deleteFeature(1, 2);

      expect(mockDelete).toHaveBeenCalledWith('/features/1?userId=2');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('vote', () => {
    test('should make POST request with vote data', async () => {
      const mockVote = { id: 1, featureId: 1, userId: 1, voteType: 'like' };
      mockPost.mockResolvedValueOnce({ data: mockVote });

      const result = await vote(1, 1, 'like');

      expect(mockPost).toHaveBeenCalledWith('/votes', {
        featureId: 1,
        userId: 1,
        voteType: 'like'
      });
      expect(result).toEqual(mockVote);
    });

    test('should handle dislike vote', async () => {
      const mockVote = { id: 1, featureId: 1, userId: 1, voteType: 'dislike' };
      mockPost.mockResolvedValueOnce({ data: mockVote });

      const result = await vote(1, 1, 'dislike');

      expect(mockPost).toHaveBeenCalledWith('/votes', {
        featureId: 1,
        userId: 1,
        voteType: 'dislike'
      });
      expect(result).toEqual(mockVote);
    });
  });

  describe('removeVote', () => {
    test('should make DELETE request with featureId and userId', async () => {
      const mockResponse = { message: 'Vote deleted successfully' };
      mockDelete.mockResolvedValueOnce({ data: mockResponse });

      const result = await removeVote(1, 2);

      expect(mockDelete).toHaveBeenCalledWith('/votes?featureId=1&userId=2');
      expect(result).toEqual(mockResponse);
    });
  });
});
