import { ActivityIndicator, Text, View } from "react-native";
import { colors, spacing, typography } from "../constants/theme";

export default function SplashScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.navy,
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.md,
      }}
    >
      <Text style={{ color: colors.white, fontSize: typography.title, fontWeight: "800" }}>
        ShiftPe
      </Text>
      <ActivityIndicator color={colors.white} />
    </View>
  );
}
