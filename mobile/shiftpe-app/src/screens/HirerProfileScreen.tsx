import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ScreenContainer from "../components/ui/ScreenContainer";
import ScreenIntro from "../components/design/ScreenIntro";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "../theme";
import { useAuth } from "../context/AuthContext";

export default function HirerProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <ScreenContainer>
      <ScreenIntro eyebrow="Hirer profile" title="Trust workspace" subtitle="Employer credibility helps workers accept faster." />
      <View style={{ alignItems: "center", backgroundColor: COLORS.white, borderColor: COLORS.border, borderRadius: RADIUS.xl, borderWidth: 1, gap: SPACING.md, padding: SPACING.lg }}>
        <Avatar name={user?.fullName} size={88} />
        <View style={{ alignItems: "center", gap: SPACING.xs }}>
          <Text style={{ color: COLORS.text, fontSize: TYPOGRAPHY.heading, fontWeight: "900" }}>{user?.fullName || "ShiftPe Hirer"}</Text>
          <Text style={{ color: COLORS.gray, fontSize: TYPOGRAPHY.small }}>Verified local hirer</Text>
        </View>
        <View style={{ flexDirection: "row", gap: SPACING.sm }}>
          <Badge label="Fast response" tone="success" />
          <Badge label="Live hiring" tone="primary" />
        </View>
      </View>
      <TouchableOpacity
        activeOpacity={0.86}
        onPress={logout}
        style={{ alignItems: "center", backgroundColor: COLORS.white, borderColor: COLORS.border, borderRadius: RADIUS.pill, borderWidth: 1, flexDirection: "row", gap: SPACING.sm, justifyContent: "center", minHeight: 54 }}
      >
        <Ionicons name="log-out-outline" color={COLORS.text} size={20} />
        <Text style={{ color: COLORS.text, fontSize: TYPOGRAPHY.body, fontWeight: "900" }}>Logout</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}
