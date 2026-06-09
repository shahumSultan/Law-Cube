"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "./api";
import type { User } from "./types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string, firmName?: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
  setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,
      _hasHydrated: false,

      setHasHydrated: (v) => set({ _hasHydrated: v }),
      setUser: (user) => set({ user }),

      clearError: () => set({ error: null }),

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const tokens = await authApi.login(email, password);
          set({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
          });
          const me = await authApi.me();
          set({ user: me, isLoading: false });
        } catch (e) {
          set({ isLoading: false, error: (e as Error).message });
          throw e;
        }
      },

      loginWithGoogle: async (idToken, firmName = "") => {
        set({ isLoading: true, error: null });
        try {
          const tokens = await authApi.google(idToken, firmName);
          set({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
          });
          const me = await authApi.me();
          set({ user: me, isLoading: false });
        } catch (e) {
          set({ isLoading: false, error: (e as Error).message });
          throw e;
        }
      },

      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null, error: null });
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) throw new Error("No refresh token");
        const tokens = await authApi.refresh(refreshToken);
        set({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        });
      },
    }),
    {
      name: "lc-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);
