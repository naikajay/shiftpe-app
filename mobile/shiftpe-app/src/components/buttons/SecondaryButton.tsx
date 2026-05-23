import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";

import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "../../theme";

interface SecondaryButtonProps extends TouchableOpacityProps {
  label: string;
}

export default function SecondaryButton({ label, disabled, style, ...props }: SecondaryButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      disabled={disabled}
      style={[
        {
          alignItems: "center",
          backgroundColor: COLORS.white,
          borderColor: COLORS.border,
          borderRadius: RADIUS.pill,
          borderWidth: 1,
          justifyContent: "center",
          minHeight: 54,
          paddingHorizontal: SPACING.md,
        },
        style,
      ]}
      {...props}
    >
      <Text style={{ color: disabled ? COLORS.gray : COLORS.text, fontSize: TYPOGRAPHY.body, fontWeight: "900" }}>{label}</Text>
    </TouchableOpacity>
  );
}
