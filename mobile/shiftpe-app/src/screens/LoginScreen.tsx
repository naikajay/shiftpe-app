import { useRef, useState } from "react";
import { Alert, Platform } from "react-native";
import type { FirebaseRecaptchaVerifierModal as FirebaseRecaptchaVerifierModalType } from "expo-firebase-recaptcha";

import AppButton from "../components/AppButton";
import AppTextInput from "../components/AppTextInput";
import AuthCard from "../components/AuthCard";
import ErrorMessage from "../components/ErrorMessage";
import { firebaseConfig } from "../config/firebase";
import { useAuth } from "../context/AuthContext";

const FirebaseRecaptchaVerifierModal =
  Platform.OS === "web"
    ? null
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    : require("expo-firebase-recaptcha").FirebaseRecaptchaVerifierModal;

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const { requestOtp, loading, error, clearError } = useAuth();
  const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModalType>(null);

  const handleContinue = async () => {
    try {
      clearError();
      await requestOtp(phone, recaptchaVerifier.current);
    } catch (caught: any) {
      Alert.alert("Login", caught.message);
    }
  };

  return (
    <>
      {FirebaseRecaptchaVerifierModal ? (
        <FirebaseRecaptchaVerifierModal
          ref={recaptchaVerifier}
          firebaseConfig={firebaseConfig}
          title="Confirm you are not a robot"
          cancelLabel="Close"
        />
      ) : null}
      <AuthCard title="Enter your phone" subtitle="OTP login keeps onboarding light. No resume, no long forms.">
        <AppTextInput
          label="Phone number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          autoCapitalize="none"
          placeholder="+919876543210"
          editable={!loading}
        />
        <ErrorMessage message={error} />
        <AppButton label="Continue" onPress={handleContinue} loading={loading} />
      </AuthCard>
    </>
  );
}
