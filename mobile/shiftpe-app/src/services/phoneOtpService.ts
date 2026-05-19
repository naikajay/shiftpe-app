import type { FirebaseAuthApplicationVerifier } from "expo-firebase-recaptcha";
import { Platform } from "react-native";
import {
  assertFirebaseConfig,
  getFirebaseIdTokenFromOtp,
  getPhoneAuthProvider,
} from "../config/firebase";

const E164_PHONE_REGEX = /^\+[1-9]\d{7,14}$/;

const normalizeOtpError = (error: any) => {
  if (error?.code === "auth/operation-not-supported-in-this-environment") {
    return new Error(
      "Phone OTP is not supported in this runtime. Open the app in Expo Go or a development build on a device, then try again."
    );
  }

  return new Error(error?.message || "Could not complete phone verification.");
};

export const phoneOtpService = {
  validatePhone(phone: string) {
    return E164_PHONE_REGEX.test(phone.trim());
  },

  async sendOtp(phone: string, verifier: FirebaseAuthApplicationVerifier | null) {
    if (!this.validatePhone(phone)) {
      throw new Error("Enter phone in international format, for example +919876543210.");
    }

    if (Platform.OS === "web") {
      throw new Error(
        "Phone OTP is not supported in the web preview. Open the app in Expo Go or a development build on a device."
      );
    }

    if (!verifier) {
      throw new Error("Firebase reCAPTCHA verifier is not ready yet.");
    }

    assertFirebaseConfig();
    try {
      const verificationId = await getPhoneAuthProvider().verifyPhoneNumber(
        phone.trim(),
        verifier
      );

      return {
        phone: phone.trim(),
        verificationId,
      };
    } catch (error) {
      throw normalizeOtpError(error);
    }
  },

  async verifyOtpCode(verificationId: string, otp: string): Promise<string> {
    if (!otp.trim()) {
      throw new Error("Enter the OTP sent to your phone.");
    }

    assertFirebaseConfig();
    try {
      return await getFirebaseIdTokenFromOtp(verificationId, otp.trim());
    } catch (error) {
      throw normalizeOtpError(error);
    }
  },
};
