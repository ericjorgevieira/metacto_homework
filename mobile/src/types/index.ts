export interface User {
  id: number;
  username: string;
}

export interface Feature {
  id: number;
  title: string;
  description: string;
  user_id: number;
  username: string;
  created_at: string;
  updated_at: string;
  likes: number;
  dislikes: number;
  user_vote: 'like' | 'dislike' | null;
}

export type VoteType = 'like' | 'dislike';

export interface Vote {
  id: number;
  featureId: number;
  userId: number;
  voteType: VoteType;
}

export interface UserContextType {
  user: User | null;
  loading: boolean;
  saveUser: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
}
