import { ActivityIndicator, View } from "react-native";

import { COLORS, SPACING } from "../../theme";

export default function Loader() {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", padding: SPACING.xl }}>
      <ActivityIndicator color={COLORS.primary} size="large" />
    </View>
  );
}
