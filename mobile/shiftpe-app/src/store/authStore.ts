import { create } from "zustand";

import { storageKeys } from "../constants/storage";
import { auth } from "../services/auth";
import { registerPushNotifications } from "../services/pushNotifications";
import { useSocketStore } from "./socketStore";
import { AuthUser } from "../types/auth";
import { storage } from "../utils/storage";

type AuthStep = "checking" | "signedOut" | "otpPending" | "rolePending" | "signedIn";

export interface PendingAuth {
  phone: string;
  verificationId?: string;
  firebaseIdToken?: string;
}

interface AuthStoreState {
  user: AuthUser | null;
  token: string | null;
  pendingAuth: PendingAuth | null;
  step: AuthStep;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (user: AuthUser, token: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  setPendingAuth: (pendingAuth: PendingAuth | null) => Promise<void>;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  refreshUser: () => Promise<void>;
  updateUser: (user: AuthUser) => Promise<void>;
}

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  user: null,
  token: null,
  pendingAuth: null,
  step: "checking",
  loading: false,
  error: null,
  isAuthenticated: false,

  async login(user, token) {
    await storage.setString(storageKeys.authToken, token);
    await storage.setJson(storageKeys.authUser, user);
    await storage.remove(storageKeys.pendingAuth);
    set({
      user,
      token,
      pendingAuth: null,
      step: "signedIn",
      isAuthenticated: true,
      error: null,
    });
    await useSocketStore.getState().connect().catch(() => undefined);
    await registerPushNotifications().catch(() => undefined);
  },

  async logout() {
    useSocketStore.getState().disconnect();
    await storage.multiRemove([
      storageKeys.authToken,
      storageKeys.authUser,
      storageKeys.pendingAuth,
    ]);
    set({
      user: null,
      token: null,
      pendingAuth: null,
      step: "signedOut",
      isAuthenticated: false,
      error: null,
    });
  },

  async restoreSession() {
    set({ loading: true, step: "checking", error: null });

    try {
      const [token, cachedUser, pendingAuth] = await Promise.all([
        storage.getString(storageKeys.authToken),
        storage.getJson<AuthUser>(storageKeys.authUser),
        storage.getJson<PendingAuth>(storageKeys.pendingAuth),
      ]);

      if (token && cachedUser) {
        set({
          token,
          user: cachedUser,
          step: "signedIn",
          isAuthenticated: true,
          pendingAuth: null,
        });

        try {
          const latestUser = await auth.getMe();
          await storage.setJson(storageKeys.authUser, latestUser);
          set({ user: latestUser });
          await useSocketStore.getState().connect().catch(() => undefined);
          await registerPushNotifications().catch(() => undefined);
        } catch {
          await get().logout();
          set({ error: "Session expired. Please login again." });
        }
        return;
      }

      if (pendingAuth) {
        set({
          pendingAuth,
          step: pendingAuth.firebaseIdToken ? "rolePending" : "otpPending",
          isAuthenticated: false,
        });
        return;
      }

      set({ step: "signedOut", isAuthenticated: false });
    } catch {
      set({
        step: "signedOut",
        isAuthenticated: false,
        error: "Could not restore your session.",
      });
    } finally {
      set({ loading: false });
    }
  },

  async setPendingAuth(pendingAuth) {
    if (pendingAuth) {
      await storage.setJson(storageKeys.pendingAuth, pendingAuth);
      set({
        pendingAuth,
        step: pendingAuth.firebaseIdToken ? "rolePending" : "otpPending",
      });
    } else {
      await storage.remove(storageKeys.pendingAuth);
      set({ pendingAuth: null });
    }
  },

  setError(error) {
    set({ error });
  },

  setLoading(loading) {
    set({ loading });
  },

  async refreshUser() {
    const latestUser = await auth.getMe();
    await storage.setJson(storageKeys.authUser, latestUser);
    set({ user: latestUser });
  },

  async updateUser(user) {
    await storage.setJson(storageKeys.authUser, user);
    set({ user });
  },
}));
