import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "../../theme";
import { AuthUser } from "../../types/auth";

export default function WorkerCard({ worker }: { worker: Partial<AuthUser> }) {
  return (
    <View style={{ alignItems: "center", backgroundColor: COLORS.white, borderColor: COLORS.border, borderRadius: RADIUS.lg, borderWidth: 1, flexDirection: "row", gap: SPACING.md, padding: SPACING.md }}>
      <Avatar name={worker.fullName} uri={worker.profileImage} />
      <View style={{ flex: 1, gap: SPACING.xs }}>
        <Text style={{ color: COLORS.text, fontSize: TYPOGRAPHY.body, fontWeight: "900" }}>{worker.fullName || "Worker"}</Text>
        <Text numberOfLines={1} style={{ color: COLORS.gray, fontSize: TYPOGRAPHY.small }}>{worker.skills?.join(", ") || "Ready for local shifts"}</Text>
        <View style={{ flexDirection: "row", gap: SPACING.sm }}>
          <Badge label={worker.ratingAverage ? `${worker.ratingAverage.toFixed(1)} rating` : "No ratings yet"} tone={worker.ratingAverage ? "success" : "neutral"} />
          <Badge label="Available" tone="primary" />
        </View>
      </View>
      <Ionicons name="chevron-forward" color={COLORS.gray} size={20} />
    </View>
  );
}
