import { create } from 'zustand';

const useUiStore = create((set) => ({
  sidebarOpen: true,
  activeModal: null,
  modalProps: {},

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  openModal: (name, props = {}) => set({ activeModal: name, modalProps: props }),

  closeModal: () => set({ activeModal: null, modalProps: {} }),
}));

export default useUiStore;
