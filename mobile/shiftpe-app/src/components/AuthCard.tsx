import { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "../constants/theme";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: colors.navy,
        padding: spacing.lg,
        justifyContent: "center",
      }}
    >
      <View style={{ marginBottom: spacing.xl }}>
        <Text style={{ color: colors.white, fontSize: typography.title, fontWeight: "800" }}>
          ShiftPe
        </Text>
        <Text style={{ color: "#C9D7E8", fontSize: typography.body, marginTop: spacing.xs }}>
          {title}
        </Text>
      </View>

      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: radius.lg,
          padding: spacing.lg,
          gap: spacing.md,
        }}
      >
        {subtitle ? (
          <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 19 }}>
            {subtitle}
          </Text>
        ) : null}
        {children}
      </View>
    </ScrollView>
  );
}
