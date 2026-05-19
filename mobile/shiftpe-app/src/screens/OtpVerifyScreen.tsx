import { useState } from "react";
import { Alert } from "react-native";

import AppButton from "../components/AppButton";
import AppTextInput from "../components/AppTextInput";
import AuthCard from "../components/AuthCard";
import ErrorMessage from "../components/ErrorMessage";
import { useAuth } from "../context/AuthContext";

export default function OtpVerifyScreen() {
  const [otp, setOtp] = useState("");
  const { pendingAuth, verifyOtp, loading, error, clearError } = useAuth();

  const handleVerify = async () => {
    try {
      clearError();
      await verifyOtp(otp.trim());
    } catch (caught: any) {
      Alert.alert("OTP verification", caught.message);
    }
  };

  return (
    <AuthCard title="Verify OTP" subtitle={`Sent to ${pendingAuth?.phone || "your phone"}.`}>
      <AppTextInput
        label="OTP code"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        placeholder="6-digit code"
        editable={!loading}
      />
      <ErrorMessage message={error} />
      <AppButton label="Verify" onPress={handleVerify} loading={loading} />
    </AuthCard>
  );
}
