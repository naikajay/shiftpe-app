import { Text, View } from "react-native";

import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "../../theme";

type BadgeTone = "primary" | "success" | "neutral" | "danger";

const tones = {
  primary: { backgroundColor: COLORS.primarySoft, color: COLORS.primary },
  success: { backgroundColor: COLORS.successSoft, color: COLORS.success },
  neutral: { backgroundColor: COLORS.background, color: COLORS.text },
  danger: { backgroundColor: "#FEF2F2", color: COLORS.danger },
};

export default function Badge({ label, tone = "neutral" }: { label: string; tone?: BadgeTone }) {
  const selected = tones[tone];

  return (
    <View style={{ backgroundColor: selected.backgroundColor, borderRadius: RADIUS.pill, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs }}>
      <Text style={{ color: selected.color, fontSize: TYPOGRAPHY.small, fontWeight: "900" }}>{label}</Text>
    </View>
  );
}
