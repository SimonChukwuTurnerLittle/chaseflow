import { create } from 'zustand';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('chaseflow_token') || null,
  role: null,

  setAuth: (user, token) => {
    localStorage.setItem('chaseflow_token', token);
    set({ user, token, role: user?.role || null });
  },

  logout: () => {
    localStorage.removeItem('chaseflow_token');
    set({ user: null, token: null, role: null });
  },

  setUser: (user) => {
    set({ user, role: user?.role || null });
  },

  isAdmin: () => get().role === 'ADMIN',

  isHandler: () => {
    const { role } = get();
    return role === 'ADMIN' || role === 'SALES_HANDLER';
  },
}));

export default useAuthStore;
