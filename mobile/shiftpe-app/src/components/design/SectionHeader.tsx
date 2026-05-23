import { Text, View } from "react-native";

import { colors, spacing, typography } from "../../constants/theme";

export default function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: spacing.lg }}>
      <Text style={{ color: colors.text, fontSize: typography.heading, fontWeight: "900" }}>{title}</Text>
      {action ? <Text style={{ color: colors.accent, fontSize: typography.small, fontWeight: "900" }}>{action}</Text> : null}
    </View>
  );
}
