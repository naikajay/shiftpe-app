import { Text, View } from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "../../theme";

export default function RealtimeTaskPopup({ title, message }: { title: string; message: string }) {
  return (
    <Animated.View
      entering={FadeInDown.springify().damping(16)}
      exiting={FadeOutUp.duration(180)}
      style={{
        backgroundColor: COLORS.white,
        borderColor: COLORS.border,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        flexDirection: "row",
        gap: SPACING.md,
        padding: SPACING.md,
        ...SHADOWS.floating,
      }}
    >
      <View style={{ alignItems: "center", backgroundColor: COLORS.primarySoft, borderRadius: 16, height: 44, justifyContent: "center", width: 44 }}>
        <Ionicons name="flash" color={COLORS.primary} size={22} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: COLORS.text, fontSize: TYPOGRAPHY.body, fontWeight: "900" }}>{title}</Text>
        <Text style={{ color: COLORS.gray, fontSize: TYPOGRAPHY.small, lineHeight: 19 }}>{message}</Text>
      </View>
    </Animated.View>
  );
}
