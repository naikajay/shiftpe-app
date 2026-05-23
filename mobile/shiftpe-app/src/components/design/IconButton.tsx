import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../constants/theme";

export default function IconButton({ icon, onPress }: { icon: keyof typeof Ionicons.glyphMap; onPress?: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      style={{ alignItems: "center", backgroundColor: colors.white, borderRadius: 999, height: 46, justifyContent: "center", width: 46 }}
    >
      <Ionicons name={icon} color={colors.text} size={21} />
    </TouchableOpacity>
  );
}
