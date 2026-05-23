import { ActivityIndicator, Text, View } from "react-native";
import { colors, spacing, typography } from "../constants/theme";

export default function SplashScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.accent,
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.md,
      }}
    >
      <Text style={{ color: colors.white, fontSize: 42, fontWeight: "900" }}>
        ShiftPe
      </Text>
      <Text style={{ color: colors.white, fontSize: typography.small, fontWeight: "800", opacity: 0.84 }}>
        Swipe and earn instantly
      </Text>
      <ActivityIndicator color={colors.white} />
    </View>
  );
}
