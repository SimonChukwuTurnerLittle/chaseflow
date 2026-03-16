import { create } from 'zustand';

const storedUser = (() => {
  try { return JSON.parse(localStorage.getItem('chaseflow_user')); } catch { return null; }
})();

const useAuthStore = create((set, get) => ({
  user: storedUser || null,
  token: localStorage.getItem('chaseflow_token') || null,
  role: storedUser?.role || null,

  setAuth: (user, token) => {
    localStorage.setItem('chaseflow_token', token);
    localStorage.setItem('chaseflow_user', JSON.stringify(user));
    set({ user, token, role: user?.role || null });
  },

  logout: () => {
    localStorage.removeItem('chaseflow_token');
    localStorage.removeItem('chaseflow_user');
    set({ user: null, token: null, role: null });
  },

  setUser: (user) => {
    localStorage.setItem('chaseflow_user', JSON.stringify(user));
    set({ user, role: user?.role || null });
  },

  isAdmin: () => get().role === 'ADMIN',

  isHandler: () => {
    const { role } = get();
    return role === 'ADMIN' || role === 'SALES_HANDLER';
  },
}));

export default useAuthStore;
