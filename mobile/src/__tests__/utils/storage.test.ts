import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveUser, getUser, clearUser } from '../../utils/storage';
import { User } from '../../types';

describe('Storage Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveUser', () => {
    test('should save user to AsyncStorage', async () => {
      const user: User = { id: 1, username: 'testuser' };

      await saveUser(user);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@feature_voting_user',
        JSON.stringify(user)
      );
    });

    test('should throw error if AsyncStorage fails', async () => {
      const user: User = { id: 1, username: 'testuser' };
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      await expect(saveUser(user)).rejects.toThrow('Storage error');
    });
  });

  describe('getUser', () => {
    test('should retrieve user from AsyncStorage', async () => {
      const user: User = { id: 1, username: 'testuser' };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(user));

      const result = await getUser();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@feature_voting_user');
      expect(result).toEqual(user);
    });

    test('should return null when no user stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const result = await getUser();

      expect(result).toBeNull();
    });

    test('should return null on error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      const result = await getUser();

      expect(result).toBeNull();
    });

    test('should parse JSON correctly', async () => {
      const user: User = { id: 2, username: 'anotheruser' };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(user));

      const result = await getUser();

      expect(result).toEqual(user);
      expect(result?.id).toBe(2);
      expect(result?.username).toBe('anotheruser');
    });
  });

  describe('clearUser', () => {
    test('should remove user from AsyncStorage', async () => {
      await clearUser();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@feature_voting_user');
    });

    test('should throw error if removal fails', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      await expect(clearUser()).rejects.toThrow('Storage error');
    });
  });
});
