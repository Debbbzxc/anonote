import { create } from "zustand";
import { api } from "@/lib/api";

interface AuthState {
  token: string | null;
  userId: string | null;
  username: string | null;
  salt: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  password: string | null;

  register: (username: string, password: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("anonote-token"),
  userId: localStorage.getItem("anonote-userId"),
  username: localStorage.getItem("anonote-username"),
  salt: localStorage.getItem("anonote-salt"),
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem("anonote-token"),
  password: sessionStorage.getItem("anonote-password"),

  register: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.auth.register({ username, password });
      localStorage.setItem("anonote-token", res.token);
      localStorage.setItem("anonote-userId", res.userId);
      localStorage.setItem("anonote-username", res.username);
      localStorage.setItem("anonote-salt", res.salt);
      sessionStorage.setItem("anonote-password", password);
      set({
        token: res.token,
        userId: res.userId,
        username: res.username,
        salt: res.salt,
        password,
        loading: false,
        isAuthenticated: true,
      });
    } catch (err) {
      set({ loading: false, error: (err as Error).message });
      throw err;
    }
  },

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.auth.login({ username, password });
      localStorage.setItem("anonote-token", res.token);
      localStorage.setItem("anonote-userId", res.userId);
      localStorage.setItem("anonote-username", res.username);
      localStorage.setItem("anonote-salt", res.salt);
      sessionStorage.setItem("anonote-password", password);
      set({
        token: res.token,
        userId: res.userId,
        username: res.username,
        salt: res.salt,
        password,
        loading: false,
        isAuthenticated: true,
      });
    } catch (err) {
      set({ loading: false, error: (err as Error).message });
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.auth.logout();
    } catch {
      // Clear local state even if server call fails
    }
    localStorage.removeItem("anonote-token");
    localStorage.removeItem("anonote-userId");
    localStorage.removeItem("anonote-username");
    localStorage.removeItem("anonote-salt");
    sessionStorage.removeItem("anonote-password");
    set({
      token: null,
      userId: null,
      username: null,
      salt: null,
      password: null,
      isAuthenticated: false,
    });
  },

  clearError: () => set({ error: null }),
}));
