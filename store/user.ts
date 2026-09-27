import { create } from 'zustand';

type UserState = {
  user_id: string | null;
  username: string | null;
  setUser: (user_id: string, username: string) => void;
  reset: () => void;
};

export const useUserStore = create<UserState>((set) => ({
  user_id: null,
  username: null,
  setUser: (user_id, username) => set({ user_id, username }),
  reset: () => set({ user_id: null, username: null }),
}));
