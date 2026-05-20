import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

import AppButton from "../components/AppButton";
import AppTextInput from "../components/AppTextInput";
import AuthCard from "../components/AuthCard";
import ErrorMessage from "../components/ErrorMessage";
import { colors, radius, spacing, typography } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types/auth";

const roles: { label: string; value: UserRole }[] = [
  { label: "Worker", value: "worker" },
  { label: "Task Provider", value: "taskProvider" },
];

export default function RoleSelectScreen() {
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole>("worker");
  const [skills, setSkills] = useState("");
  const { completeRoleProfile, loading, error, clearError } = useAuth();

  const handleSubmit = async () => {
    try {
      clearError();
      await completeRoleProfile({
        fullName,
        role,
        skills:
          role === "worker"
            ? skills
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
            : [],
      });
    } catch (caught: any) {
      Alert.alert("Profile", caught.message);
    }
  };

  return (
    <AuthCard title="Choose role" subtitle="Set up the account used on this device.">
      <AppTextInput
        label="Full name"
        value={fullName}
        onChangeText={setFullName}
        placeholder="Amit Kumar"
        editable={!loading}
      />

      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        {roles.map((item) => {
          const selected = role === item.value;
          return (
            <TouchableOpacity
              key={item.value}
              onPress={() => setRole(item.value)}
              disabled={loading}
              style={{
                flex: 1,
                minHeight: 52,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: selected ? colors.navy : colors.border,
                backgroundColor: selected ? colors.navy : colors.white,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: spacing.sm,
              }}
            >
              <Text
                style={{
                  color: selected ? colors.white : colors.navy,
                  fontSize: typography.small,
                  fontWeight: "800",
                  textAlign: "center",
                }}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {role === "worker" ? (
        <>
          <AppTextInput
            label="Skills"
            value={skills}
            onChangeText={setSkills}
            placeholder="Packing, delivery, retail"
            editable={!loading}
          />
        </>
      ) : null}

      <ErrorMessage message={error} />
      <AppButton label="Finish setup" onPress={handleSubmit} loading={loading} />
    </AuthCard>
  );
}
