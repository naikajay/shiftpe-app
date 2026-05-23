import { Text, View } from "react-native";

import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "../../theme";

export default function ChatBubble({ message, mine }: { message: string; mine?: boolean }) {
  return (
    <View
      style={{
        alignSelf: mine ? "flex-end" : "flex-start",
        backgroundColor: mine ? COLORS.primary : COLORS.white,
        borderBottomLeftRadius: mine ? RADIUS.md : 4,
        borderBottomRightRadius: mine ? 4 : RADIUS.md,
        borderTopLeftRadius: RADIUS.md,
        borderTopRightRadius: RADIUS.md,
        maxWidth: "82%",
        padding: SPACING.md,
      }}
    >
      <Text style={{ color: mine ? COLORS.white : COLORS.text, fontSize: TYPOGRAPHY.body, lineHeight: 22 }}>{message}</Text>
    </View>
  );
}
