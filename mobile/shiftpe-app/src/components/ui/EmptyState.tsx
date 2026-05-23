import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "../../theme";

export default function EmptyState({
  icon = "sparkles-outline",
  title,
  message,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
}) {
  return (
    <View style={{ alignItems: "center", backgroundColor: COLORS.white, borderColor: COLORS.border, borderRadius: RADIUS.lg, borderWidth: 1, gap: SPACING.sm, padding: SPACING.lg }}>
      <Ionicons name={icon} color={COLORS.primary} size={28} />
      <Text style={{ color: COLORS.text, fontSize: TYPOGRAPHY.body, fontWeight: "900", textAlign: "center" }}>{title}</Text>
      <Text style={{ color: COLORS.gray, fontSize: TYPOGRAPHY.small, lineHeight: 20, textAlign: "center" }}>{message}</Text>
    </View>
  );
}
