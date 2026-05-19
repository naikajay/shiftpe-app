import { Text, TextInput, TextInputProps, View } from "react-native";
import { colors, radius, spacing, typography } from "../constants/theme";

interface AppTextInputProps extends TextInputProps {
  label: string;
}

export default function AppTextInput({ label, style, ...props }: AppTextInputProps) {
  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={{ color: colors.text, fontSize: typography.small, fontWeight: "700" }}>
        {label}
      </Text>
      <TextInput
        placeholderTextColor={colors.muted}
        style={[
          {
            minHeight: 52,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.md,
            backgroundColor: colors.white,
            paddingHorizontal: spacing.md,
            color: colors.text,
            fontSize: typography.body,
          },
          style,
        ]}
        {...props}
      />
    </View>
  );
}
