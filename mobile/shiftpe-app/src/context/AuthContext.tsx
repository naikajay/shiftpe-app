import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import type { FirebaseAuthApplicationVerifier } from "expo-firebase-recaptcha";
import { signOut } from "firebase/auth";

import { AuthUser, UserRole, VerifyOtpPayload } from "../types/auth";
import { auth } from "../services/auth";
import { firebaseAuth } from "../config/firebase";
import { phoneOtpService } from "../services/phoneOtpService";
import { useAuthStore } from "../store/authStore";

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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const {
    user,
    token,
    pendingAuth,
    step,
    loading,
    error,
    login,
    logout: storeLogout,
    restoreSession,
    setPendingAuth,
    setError,
    setLoading,
  } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const requestOtp = useCallback(
    async (phone: string, verifier: FirebaseAuthApplicationVerifier | null) => {
    try {
      setLoading(true);
      setError(null);
      const pending = await phoneOtpService.sendOtp(phone, verifier);
      await setPendingAuth(pending);
    } catch (caught: any) {
      setError(caught.message);
      throw caught;
    } finally {
      setLoading(false);
    }
    },
    [setError, setLoading, setPendingAuth]
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

      await setPendingAuth(nextPending);
    } catch (caught: any) {
      setError(caught.message);
      throw caught;
    } finally {
      setLoading(false);
    }
  }, [pendingAuth, setError, setLoading, setPendingAuth]);

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
        await login(response.user, response.token);
      } catch (caught: any) {
        setError(caught.message);
        throw caught;
      } finally {
        setLoading(false);
      }
    },
    [login, pendingAuth, setError, setLoading]
  );

  const logout = useCallback(async () => {
    await Promise.allSettled([signOut(firebaseAuth), storeLogout()]);
  }, [storeLogout]);

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
      setError,
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
