import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('chirp_user')) || null,
  token: localStorage.getItem('chirp_token') || null,

  login: (user, token) => {
    localStorage.setItem('chirp_user', JSON.stringify(user));
    localStorage.setItem('chirp_token', token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('chirp_user');
    localStorage.removeItem('chirp_token');
    set({ user: null, token: null });
  },
}));

export default useAuthStore;
