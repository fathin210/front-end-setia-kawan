import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      logout: () => {
        localStorage.clear(); // Hapus semua localStorage
        set({ user: null, token: null });
      },
    }),
    {
      name: "auth-storage", // key untuk localStorage
    }
  )
);
