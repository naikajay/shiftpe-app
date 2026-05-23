import { Text, TouchableOpacity } from "react-native";

import { colors, spacing, typography } from "../../constants/theme";

export default function FilterChip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      style={{
        backgroundColor: active ? colors.accent : colors.white,
        borderColor: active ? colors.accent : colors.border,
        borderRadius: 999,
        borderWidth: 1,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
      }}
    >
      <Text style={{ color: active ? colors.white : colors.text, fontSize: typography.small, fontWeight: "900" }}>{label}</Text>
    </TouchableOpacity>
  );
}
