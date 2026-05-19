import { View } from "react-native";
import { colors, radius, spacing } from "../constants/theme";

export default function TaskCardSkeleton() {
  return (
    <View
      style={{
        backgroundColor: colors.white,
        borderColor: colors.border,
        borderRadius: radius.lg,
        borderWidth: 1,
        gap: spacing.md,
        padding: spacing.lg,
      }}
    >
      <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, height: 22, width: "70%" }} />
      <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, height: 14, width: "45%" }} />
      <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, height: 14, width: "100%" }} />
      <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, height: 14, width: "82%" }} />
      <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: radius.md, height: 48, width: "100%" }} />
    </View>
  );
}
