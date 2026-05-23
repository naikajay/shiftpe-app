import { ReactNode } from "react";
import { ImageBackground, ScrollView, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "../constants/theme";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

const heroImage = "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=900&q=80";

export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: colors.surface }}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <ImageBackground source={{ uri: heroImage }} style={{ minHeight: 330, justifyContent: "flex-end", padding: spacing.lg }} imageStyle={{ opacity: 0.9 }}>
        <View style={{ gap: spacing.xs }}>
          <View style={{ alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.92)", borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: spacing.xs }}>
            <Text style={{ color: colors.accent, fontSize: typography.small, fontWeight: "900" }}>Swipe and earn instantly</Text>
          </View>
          <Text style={{ color: colors.white, fontSize: 42, fontWeight: "900", lineHeight: 46 }}>ShiftPe</Text>
          <Text style={{ color: colors.white, fontSize: typography.body, fontWeight: "800" }}>Fast shifts. Real hirers. Instant earning.</Text>
        </View>
      </ImageBackground>

      <View style={{ gap: spacing.md, padding: spacing.lg }}>
        <View style={{ gap: spacing.xs }}>
          <Text style={{ color: colors.text, fontSize: 28, fontWeight: "900", lineHeight: 34 }}>{title}</Text>
          {subtitle ? <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 20 }}>{subtitle}</Text> : null}
        </View>
        <View
          style={{
            backgroundColor: colors.white,
            borderColor: colors.border,
            borderRadius: radius.xl,
            borderWidth: 1,
            gap: spacing.md,
            padding: spacing.lg,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.08,
            shadowRadius: 22,
            elevation: 4,
          }}
        >
          {children}
        </View>
      </View>
    </ScrollView>
  );
}
