import { ImageBackground, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

import Badge from "../ui/Badge";
import Avatar from "../ui/Avatar";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "../../theme";
import { Task } from "../../types/task";
import { formatDistance, formatPay, formatShiftWindow, getCompanyName, getMatchScore, getShiftImage, getTags } from "../../utils/shiftUi";

export default function SwipeCard({ task, index = 0 }: { task: Task; index?: number }) {
  const company = getCompanyName(task, index);
  const provider = typeof task.taskProviderId === "object" ? task.taskProviderId : null;

  return (
    <Animated.View entering={FadeInUp.springify().damping(18)} style={{ backgroundColor: COLORS.white, borderRadius: RADIUS.xl, overflow: "hidden", ...SHADOWS.card }}>
      <ImageBackground
        source={{ uri: getShiftImage(task, index) }}
        style={{ height: 220, justifyContent: "space-between", padding: SPACING.md }}
        imageStyle={{ borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl }}
      >
        <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between" }}>
          <Badge label="Verified" tone="success" />
          <Badge label={formatDistance(task.distanceMeters)} />
        </View>
        <View style={{ alignItems: "center", flexDirection: "row", gap: SPACING.sm }}>
          <Avatar name={company} />
          <View>
            <Text style={{ color: COLORS.white, fontSize: TYPOGRAPHY.body, fontWeight: "900" }}>{company}</Text>
            <Text style={{ color: COLORS.white, fontSize: TYPOGRAPHY.small }}>
              {provider?.ratingAverage ? `${provider.ratingAverage.toFixed(1)} rating` : "Rating pending"} • {provider?.verified ? "verified" : "unverified"}
            </Text>
          </View>
        </View>
      </ImageBackground>

      <View style={{ gap: SPACING.md, padding: SPACING.md }}>
        <View style={{ flexDirection: "row", gap: SPACING.md, justifyContent: "space-between" }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: COLORS.text, fontSize: 22, fontWeight: "900", lineHeight: 27 }}>{task.title}</Text>
            <Text style={{ color: COLORS.gray, fontSize: TYPOGRAPHY.small }}>{formatShiftWindow(task.startTime, task.endTime)}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ color: COLORS.success, fontSize: 24, fontWeight: "900" }}>{formatPay(task)}</Text>
            <Text style={{ color: COLORS.text, fontSize: TYPOGRAPHY.small, fontWeight: "900" }}>{getMatchScore(task, index)}% Match</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm }}>
          {getTags(task).map((tag) => <Badge key={tag} label={tag} tone="primary" />)}
        </View>

        <View style={{ alignItems: "center", flexDirection: "row", gap: SPACING.sm }}>
          <Ionicons name="people-outline" color={COLORS.gray} size={18} />
          <Text style={{ color: COLORS.gray, flex: 1, fontSize: TYPOGRAPHY.small }}>
            {Math.max(task.workersNeeded - task.workersJoined, 0)} of {task.workersNeeded} spots open
          </Text>
          <Text style={{ color: COLORS.primary, fontSize: TYPOGRAPHY.small, fontWeight: "900" }}>Swipe up to apply</Text>
        </View>
      </View>
    </Animated.View>
  );
}
