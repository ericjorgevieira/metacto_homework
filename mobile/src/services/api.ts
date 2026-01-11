import axios from 'axios';
import { User, Feature, VoteType } from '../types';

// Change this to your machine's IP address when testing on physical device
// For iOS simulator: localhost works fine
// For Android emulator: use 10.0.2.2
const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User endpoints
export const createOrGetUser = async (username: string): Promise<User> => {
  const response = await api.post<User>('/users', { username });
  return response.data;
};

// Feature endpoints
export const getFeatures = async (userId: number): Promise<Feature[]> => {
  const response = await api.get<Feature[]>(`/features?userId=${userId}`);
  return response.data;
};

export const getFeature = async (id: number, userId: number): Promise<Feature> => {
  const response = await api.get<Feature>(`/features/${id}?userId=${userId}`);
  return response.data;
};

export const createFeature = async (
  title: string,
  description: string,
  userId: number
): Promise<Feature> => {
  const response = await api.post<Feature>('/features', { title, description, userId });
  return response.data;
};

export const updateFeature = async (
  id: number,
  title: string,
  description: string,
  userId: number
): Promise<Feature> => {
  const response = await api.put<Feature>(`/features/${id}`, { title, description, userId });
  return response.data;
};

export const deleteFeature = async (id: number, userId: number): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/features/${id}?userId=${userId}`);
  return response.data;
};

// Vote endpoints
export const vote = async (
  featureId: number,
  userId: number,
  voteType: VoteType
): Promise<{ id: number; featureId: number; userId: number; voteType: VoteType }> => {
  const response = await api.post('/votes', { featureId, userId, voteType });
  return response.data;
};

export const removeVote = async (
  featureId: number,
  userId: number
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `/votes?featureId=${featureId}&userId=${userId}`
  );
  return response.data;
};

export default api;
