import { Text, TextInput, TextInputProps, View } from "react-native";

import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "../../theme";

interface InputFieldProps extends TextInputProps {
  label: string;
}

export default function InputField({ label, style, ...props }: InputFieldProps) {
  return (
    <View style={{ gap: SPACING.xs }}>
      <Text style={{ color: COLORS.text, fontSize: TYPOGRAPHY.small, fontWeight: "800" }}>{label}</Text>
      <TextInput
        placeholderTextColor={COLORS.gray}
        style={[
          {
            backgroundColor: COLORS.white,
            borderColor: COLORS.border,
            borderRadius: RADIUS.md,
            borderWidth: 1,
            color: COLORS.text,
            fontSize: TYPOGRAPHY.body,
            minHeight: 52,
            paddingHorizontal: SPACING.md,
          },
          style,
        ]}
        {...props}
      />
    </View>
  );
}
