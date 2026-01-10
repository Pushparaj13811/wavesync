import { create } from "zustand";
import type { Toast } from "@/types";

interface UIState {
  isSidebarOpen: boolean;
  isQueueOpen: boolean;
  isFullPlayerOpen: boolean;
  isKeyboardHelpOpen: boolean;
  toasts: Toast[];
}

interface UIActions {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleQueue: () => void;
  setQueueOpen: (open: boolean) => void;
  toggleFullPlayer: () => void;
  setFullPlayerOpen: (open: boolean) => void;
  toggleKeyboardHelp: () => void;
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

export type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>()((set) => ({
  isSidebarOpen: true,
  isQueueOpen: false,
  isFullPlayerOpen: false,
  isKeyboardHelpOpen: false,
  toasts: [],

  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleQueue: () => set((s) => ({ isQueueOpen: !s.isQueueOpen })),
  setQueueOpen: (open) => set({ isQueueOpen: open }),
  toggleFullPlayer: () =>
    set((s) => ({ isFullPlayerOpen: !s.isFullPlayerOpen })),
  setFullPlayerOpen: (open) => set({ isFullPlayerOpen: open }),
  toggleKeyboardHelp: () =>
    set((s) => ({ isKeyboardHelpOpen: !s.isKeyboardHelpOpen })),
  addToast: (toast) =>
    set((s) => ({
      toasts: [...s.toasts, { ...toast, id: crypto.randomUUID() }],
    })),
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
