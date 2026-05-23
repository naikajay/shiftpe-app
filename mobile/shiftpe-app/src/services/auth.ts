import { API, getErrorMessage, unwrapApiResponse } from "./api";
import { ApiResponse, AuthResponse, AuthUser, VerifyOtpPayload } from "../types/auth";

const normalizeAuthResponse = (payload: AuthResponse | ApiResponse<AuthResponse>) => {
  const auth = unwrapApiResponse<AuthResponse>(payload);

  if (!auth?.token || !auth?.user) {
    throw new Error("Login response was missing token or user.");
  }

  return auth;
};

export const auth = {
  async verifyOtp(payload: VerifyOtpPayload): Promise<AuthResponse> {
    try {
      const response = await API.post<AuthResponse | ApiResponse<AuthResponse>>(
        "/auth/verify-otp",
        payload
      );
      return normalizeAuthResponse(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, "OTP verification failed."));
    }
  },

  async getMe(): Promise<AuthUser> {
    try {
      const response = await API.get<ApiResponse<{ user: AuthUser }> | { user: AuthUser }>(
        "/auth/me"
      );
      return unwrapApiResponse(response.data).user;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to restore user session."));
    }
  },

  async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await API.post<AuthResponse | ApiResponse<AuthResponse>>(
        "/auth/refresh-token"
      );
      return normalizeAuthResponse(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to refresh session."));
    }
  },

  async updatePushToken(expoPushToken: string): Promise<AuthUser> {
    try {
      const response = await API.patch<ApiResponse<{ user: AuthUser }> | { user: AuthUser }>(
        "/auth/push-token",
        { expoPushToken }
      );
      return unwrapApiResponse(response.data).user;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to update push token."));
    }
  },
};

export const authService = auth;
