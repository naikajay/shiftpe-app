import { ActivityIndicator, Text, TouchableOpacity, TouchableOpacityProps } from "react-native";

import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "../../theme";

interface PrimaryButtonProps extends TouchableOpacityProps {
  label: string;
  loading?: boolean;
}

export default function PrimaryButton({ label, loading = false, disabled, style, ...props }: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      disabled={disabled || loading}
      style={[
        {
          alignItems: "center",
          backgroundColor: disabled ? COLORS.border : COLORS.primary,
          borderRadius: RADIUS.pill,
          flexDirection: "row",
          justifyContent: "center",
          minHeight: 54,
          paddingHorizontal: SPACING.md,
          ...SHADOWS.primary,
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.white} />
      ) : (
        <Text style={{ color: COLORS.white, fontSize: TYPOGRAPHY.body, fontWeight: "900" }}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}
