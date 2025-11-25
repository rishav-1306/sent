import { create } from "zustand";

interface AuthUser {
  username: string;
  email: string;
}

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  hydrate: () => void;
  setUser: (user: AuthUser) => void;
  logout: () => void;
}

const STORAGE_KEY = "securewatch-session";

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  hydrate: () => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as AuthUser;
      set({ user: parsed, isAuthenticated: true });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  },
  setUser: (user) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
    set({ user, isAuthenticated: true });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    set({ user: null, isAuthenticated: false });
  },
}));


