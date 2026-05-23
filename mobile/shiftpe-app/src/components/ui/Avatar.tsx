import { Image, Text, View } from "react-native";

import { COLORS } from "../../theme";

export default function Avatar({ name, uri, size = 48 }: { name?: string; uri?: string; size?: number }) {
  if (uri) {
    return <Image source={{ uri }} style={{ borderRadius: size / 2, height: size, width: size }} />;
  }

  return (
    <View style={{ alignItems: "center", backgroundColor: COLORS.primarySoft, borderRadius: size / 2, height: size, justifyContent: "center", width: size }}>
      <Text style={{ color: COLORS.primary, fontSize: Math.max(16, size * 0.42), fontWeight: "900" }}>
        {(name || "S").charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}
