import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../constants/theme";

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
}

export default function EmptyState({ icon, title, message }: EmptyStateProps) {
  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: colors.white,
        borderColor: colors.border,
        borderRadius: radius.lg,
        borderWidth: 1,
        padding: spacing.xl,
        gap: spacing.sm,
      }}
    >
      <View
        style={{
          alignItems: "center",
          backgroundColor: colors.surfaceAlt,
          borderRadius: 28,
          height: 56,
          justifyContent: "center",
          width: 56,
        }}
      >
        <Ionicons name={icon} size={26} color={colors.navyMuted} />
      </View>
      <Text style={{ color: colors.text, fontSize: typography.body, fontWeight: "800" }}>
        {title}
      </Text>
      <Text
        style={{
          color: colors.muted,
          fontSize: typography.small,
          lineHeight: 19,
          textAlign: "center",
        }}
      >
        {message}
      </Text>
    </View>
  );
}
