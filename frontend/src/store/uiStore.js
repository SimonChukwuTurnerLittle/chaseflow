import { create } from 'zustand';

const useUiStore = create((set) => ({
  sidebarOpen: true,
  mobileSidebarOpen: false,
  activeModal: null,
  modalProps: {},

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  openMobileSidebar: () => set({ mobileSidebarOpen: true }),
  closeMobileSidebar: () => set({ mobileSidebarOpen: false }),

  openModal: (name, props = {}) => set({ activeModal: name, modalProps: props }),

  closeModal: () => set({ activeModal: null, modalProps: {} }),
}));

export default useUiStore;
