import { Text, View } from "react-native";

import { colors } from "../../constants/theme";

export default function ScreenIntro({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <View style={{ gap: 5 }}>
      <Text style={{ color: colors.muted, fontSize: 13, fontWeight: "800" }}>{eyebrow}</Text>
      <Text style={{ color: colors.text, fontSize: 28, fontWeight: "900", lineHeight: 34 }}>{title}</Text>
      {subtitle ? <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 20 }}>{subtitle}</Text> : null}
    </View>
  );
}
