import { Text } from "react-native";
import { colors, typography } from "../constants/theme";

export default function ErrorMessage({ message }: { message?: string | null }) {
  if (!message) return null;

  return (
    <Text style={{ color: colors.danger, fontSize: typography.small, lineHeight: 18 }}>
      {message}
    </Text>
  );
}
