import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { colors, radius, spacing, typography } from "../constants/theme";

interface AppButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
}

export default function AppButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
}: AppButtonProps) {
  const backgroundColor =
    variant === "danger"
      ? colors.danger
      : variant === "secondary"
      ? colors.white
      : colors.accent;

  const textColor = variant === "secondary" ? colors.navy : colors.white;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={{
        minHeight: 52,
        borderRadius: radius.md,
        backgroundColor: disabled ? colors.muted : backgroundColor,
        borderWidth: variant === "secondary" ? 1 : 0,
        borderColor: colors.border,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: spacing.md,
      }}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={{ color: textColor, fontSize: typography.body, fontWeight: "700" }}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
