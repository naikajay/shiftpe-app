import { Text, View } from "react-native";
import { colors, spacing, typography } from "../constants/theme";

interface ScreenHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

export default function ScreenHeader({ eyebrow, title, subtitle }: ScreenHeaderProps) {
  return (
    <View style={{ gap: spacing.xs }}>
      {eyebrow ? (
        <Text style={{ color: colors.muted, fontSize: typography.small, fontWeight: "800" }}>
          {eyebrow}
        </Text>
      ) : null}
      <Text style={{ color: colors.text, fontSize: 28, fontWeight: "900", lineHeight: 34 }}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 20 }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
