import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { FirebaseAuthApplicationVerifier } from "expo-firebase-recaptcha";
import { signOut } from "firebase/auth";

import { storageKeys } from "../constants/storage";
import { AuthUser, UserRole, VerifyOtpPayload } from "../types/auth";
import { auth } from "../services/auth";
import { clearStoredAuth } from "../services/api";
import { firebaseAuth } from "../config/firebase";
import { phoneOtpService } from "../services/phoneOtpService";

type AuthStep = "checking" | "signedOut" | "otpPending" | "rolePending" | "signedIn";

interface PendingAuth {
  phone: string;
  verificationId?: string;
  firebaseIdToken?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  pendingAuth: PendingAuth | null;
  step: AuthStep;
  loading: boolean;
  error: string | null;
  requestOtp: (
    phone: string,
    verifier: FirebaseAuthApplicationVerifier | null
  ) => Promise<void>;
  verifyOtp: (otpOrIdToken: string) => Promise<void>;
  completeRoleProfile: (input: {
    fullName: string;
    role: UserRole;
    skills?: string[];
  }) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const parseStoredUser = (value: string | null) => {
  if (!value) return null;
  return JSON.parse(value) as AuthUser;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [pendingAuth, setPendingAuth] = useState<PendingAuth | null>(null);
  const [step, setStep] = useState<AuthStep>("checking");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const persistSession = useCallback(async (nextToken: string, nextUser: AuthUser) => {
    if (!nextToken || !nextUser) {
      throw new Error("Login response was incomplete. Please try again.");
    }

    await AsyncStorage.multiSet([
      [storageKeys.authToken, nextToken],
      [storageKeys.authUser, JSON.stringify(nextUser)],
    ]);
    await AsyncStorage.removeItem(storageKeys.pendingAuth);
    setToken(nextToken);
    setUser(nextUser);
    setPendingAuth(null);
    setStep("signedIn");
  }, []);

  const restoreSession = useCallback(async () => {
    try {
      setLoading(true);
      const [[, storedToken], [, storedUser], [, storedPending]] =
        await AsyncStorage.multiGet([
          storageKeys.authToken,
          storageKeys.authUser,
          storageKeys.pendingAuth,
        ]);

      if (storedToken && storedUser) {
        const restoredUser = await auth.getMe();
        await AsyncStorage.setItem(
          storageKeys.authUser,
          JSON.stringify(restoredUser || parseStoredUser(storedUser))
        );
        setToken(storedToken);
        setUser(restoredUser);
        setStep("signedIn");
        return;
      }

      if (storedPending) {
        const restoredPending = JSON.parse(storedPending) as PendingAuth;
        setPendingAuth(restoredPending);
        setStep(restoredPending.firebaseIdToken ? "rolePending" : "otpPending");
        return;
      }

      setStep("signedOut");
    } catch {
      setStep("signedOut");
      setError("Could not restore your session.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const requestOtp = useCallback(
    async (phone: string, verifier: FirebaseAuthApplicationVerifier | null) => {
    try {
      setLoading(true);
      setError(null);
      const pending = await phoneOtpService.sendOtp(phone, verifier);
      await AsyncStorage.setItem(storageKeys.pendingAuth, JSON.stringify(pending));
      setPendingAuth(pending);
      setStep("otpPending");
    } catch (caught: any) {
      setError(caught.message);
      throw caught;
    } finally {
      setLoading(false);
    }
    },
    []
  );

  const verifyOtp = useCallback(async (otpOrIdToken: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!pendingAuth) {
        throw new Error("Start with your phone number first.");
      }

      if (!pendingAuth.verificationId && !otpOrIdToken.includes(".")) {
        throw new Error("OTP session expired. Start with your phone number again.");
      }

      const firebaseIdToken = otpOrIdToken.includes(".")
        ? otpOrIdToken
        : await phoneOtpService.verifyOtpCode(
            pendingAuth.verificationId!,
            otpOrIdToken
          );

      const nextPending = {
        ...pendingAuth,
        firebaseIdToken,
      };

      await AsyncStorage.setItem(storageKeys.pendingAuth, JSON.stringify(nextPending));
      setPendingAuth(nextPending);
      setStep("rolePending");
    } catch (caught: any) {
      setError(caught.message);
      throw caught;
    } finally {
      setLoading(false);
    }
  }, [pendingAuth]);

  const completeRoleProfile = useCallback(
    async (input: {
      fullName: string;
      role: UserRole;
      skills?: string[];
    }) => {
      try {
        setLoading(true);
        setError(null);

        if (!pendingAuth?.firebaseIdToken) {
          throw new Error("Verify OTP before selecting a role.");
        }

        const payload: VerifyOtpPayload = {
          idToken: pendingAuth.firebaseIdToken,
          fullName: input.fullName.trim(),
          role: input.role,
          skills: input.skills,
        };

        const response = await auth.verifyOtp(payload);
        await persistSession(response.token, response.user);
      } catch (caught: any) {
        setError(caught.message);
        throw caught;
      } finally {
        setLoading(false);
      }
    },
    [pendingAuth, persistSession]
  );

  const logout = useCallback(async () => {
    await Promise.allSettled([signOut(firebaseAuth), clearStoredAuth()]);
    setToken(null);
    setUser(null);
    setPendingAuth(null);
    setStep("signedOut");
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      pendingAuth,
      step,
      loading,
      error,
      requestOtp,
      verifyOtp,
      completeRoleProfile,
      logout,
      clearError: () => setError(null),
    }),
    [
      user,
      token,
      pendingAuth,
      step,
      loading,
      error,
      requestOtp,
      verifyOtp,
      completeRoleProfile,
      logout,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
