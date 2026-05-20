import { useState } from "react";
import { Alert, ScrollView, Switch, Text, View } from "react-native";

import AppButton from "../components/AppButton";
import AppTextInput from "../components/AppTextInput";
import ErrorMessage from "../components/ErrorMessage";
import ScreenHeader from "../components/ScreenHeader";
import { colors, spacing } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { tasks } from "../services/tasks";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [skills, setSkills] = useState(user?.skills?.join(", ") ?? "");
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable ?? true);
  const [aadhaarUrl, setAadhaarUrl] = useState("");
  const [panUrl, setPanUrl] = useState("");
  const [selfieUrl, setSelfieUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      await tasks.updateProfile({
        fullName: fullName.trim(),
        skills: skills
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        isAvailable,
      });
      Alert.alert("Profile", "Profile updated.");
    } catch (caught: any) {
      setError(caught.message);
    } finally {
      setLoading(false);
    }
  };

  const submitVerifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const uploads = [
        aadhaarUrl ? tasks.submitVerification({ documentType: "aadhaar" as const, documentUrl: aadhaarUrl }) : null,
        panUrl ? tasks.submitVerification({ documentType: "pan" as const, documentUrl: panUrl }) : null,
        selfieUrl ? tasks.submitVerification({ documentType: "selfie" as const, documentUrl: selfieUrl }) : null,
      ].filter(Boolean);

      await Promise.all(uploads);
      Alert.alert("Verification", "Documents submitted for review.");
    } catch (caught: any) {
      setError(caught.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.surface, flex: 1 }}
      contentContainerStyle={{ gap: spacing.lg, padding: spacing.lg, paddingTop: spacing.xl }}
    >
      <ScreenHeader
        eyebrow="Worker profile"
        title="Availability and skills"
        subtitle="Keep this current so nearby customers can find you."
      />

      <View style={{ gap: spacing.md }}>
        <AppTextInput label="Full name" value={fullName} onChangeText={setFullName} />
        <AppTextInput label="Skills" value={skills} onChangeText={setSkills} placeholder="delivery, packing" />
        <View
          style={{
            alignItems: "center",
            backgroundColor: colors.white,
            borderColor: colors.border,
            borderRadius: 14,
            borderWidth: 1,
            flexDirection: "row",
            justifyContent: "space-between",
            padding: spacing.md,
          }}
        >
          <Text style={{ color: colors.text, fontWeight: "800" }}>Available for work</Text>
          <Switch value={isAvailable} onValueChange={setIsAvailable} />
        </View>
      </View>

      <ErrorMessage message={error} />
      <AppButton label="Save profile" onPress={saveProfile} loading={loading} />

      <View style={{ gap: spacing.md }}>
        <ScreenHeader
          eyebrow="Verification"
          title="KYC documents"
          subtitle="Add secure URLs for Aadhaar, PAN, and selfie documents."
        />
        <AppTextInput label="Aadhaar URL" value={aadhaarUrl} onChangeText={setAadhaarUrl} />
        <AppTextInput label="PAN URL" value={panUrl} onChangeText={setPanUrl} />
        <AppTextInput label="Selfie URL" value={selfieUrl} onChangeText={setSelfieUrl} />
        <AppButton label="Submit verification" onPress={submitVerifications} loading={loading} />
      </View>
      <AppButton label="Logout" onPress={logout} variant="secondary" />
    </ScrollView>
  );
}
