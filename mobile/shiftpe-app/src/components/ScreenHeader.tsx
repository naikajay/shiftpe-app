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
        <Text style={{ color: colors.accent, fontSize: typography.small, fontWeight: "800" }}>
          {eyebrow}
        </Text>
      ) : null}
      <Text style={{ color: colors.text, fontSize: typography.title, fontWeight: "900" }}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={{ color: colors.muted, fontSize: typography.body, lineHeight: 23 }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
