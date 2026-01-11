import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, UserContextType } from '../types';
import { getUser, saveUser as saveUserStorage, clearUser as clearUserStorage } from '../utils/storage';

export const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async (): Promise<void> => {
    try {
      const savedUser = await getUser();
      if (savedUser) {
        setUser(savedUser);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveUser = async (userData: User): Promise<void> => {
    try {
      await saveUserStorage(userData);
      setUser(userData);
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await clearUserStorage();
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  const value: UserContextType = {
    user,
    loading,
    saveUser,
    logout,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
