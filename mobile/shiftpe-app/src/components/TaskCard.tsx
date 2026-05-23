import { ActivityIndicator, ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, radius, spacing, typography } from "../constants/theme";
import { Task } from "../types/task";
import { formatDistance, formatPay, formatShiftWindow, getCompanyName, getMatchScore, getShiftImage, getTags } from "../utils/shiftUi";

interface TaskCardProps {
  task: Task;
  onApply: (taskId: string) => void;
  onPress?: (task: Task) => void;
  applying?: boolean;
  disabled?: boolean;
  compact?: boolean;
  index?: number;
}

export default function TaskCard({
  task,
  onApply,
  onPress,
  applying = false,
  disabled = false,
  compact = false,
  index = 0,
}: TaskCardProps) {
  const spotsLeft = Math.max(task.workersNeeded - task.workersJoined, 0);
  const company = getCompanyName(task, index);

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => onPress?.(task)}
      style={{
        backgroundColor: colors.white,
        borderRadius: radius.lg,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.08,
        shadowRadius: 22,
        elevation: 4,
        width: compact ? 286 : undefined,
      }}
    >
      <ImageBackground
        source={{ uri: getShiftImage(task, index) }}
        style={{ height: compact ? 142 : 188, justifyContent: "space-between", padding: spacing.md }}
        imageStyle={{ borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={badgeStyle}>
            <Ionicons name="shield-checkmark" color={colors.success} size={14} />
            <Text style={badgeTextStyle}>Verified</Text>
          </View>
          <View style={badgeStyle}>
            <Ionicons name="navigate" color={colors.text} size={14} />
            <Text style={badgeTextStyle}>{formatDistance(task.distanceMeters)}</Text>
          </View>
        </View>

        <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.sm }}>
          <View style={{ alignItems: "center", backgroundColor: colors.white, borderRadius: 16, height: 46, justifyContent: "center", width: 46 }}>
            <Text style={{ color: colors.accent, fontSize: 20, fontWeight: "900" }}>{company.charAt(0)}</Text>
          </View>
          <Text numberOfLines={1} style={{ color: colors.white, flex: 1, fontSize: typography.small, fontWeight: "900" }}>
            {company}
          </Text>
        </View>
      </ImageBackground>

      <View style={{ gap: spacing.md, padding: spacing.md }}>
        <View style={{ alignItems: "flex-start", flexDirection: "row", gap: spacing.md, justifyContent: "space-between" }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text numberOfLines={2} style={{ color: colors.text, fontSize: compact ? 17 : 20, fontWeight: "900", lineHeight: compact ? 21 : 25 }}>
              {task.title}
            </Text>
            <Text numberOfLines={1} style={{ color: colors.muted, fontSize: typography.small }}>
              {task.address}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end", gap: 4 }}>
            <Text style={{ color: colors.success, fontSize: compact ? 18 : 22, fontWeight: "900" }}>
              {formatPay(task)}
            </Text>
            <Text style={{ color: colors.text, fontSize: 12, fontWeight: "800" }}>{getMatchScore(task, index)}% Match</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
          {getTags(task).map((tag) => (
            <View key={tag} style={{ backgroundColor: colors.surface, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 5 }}>
              <Text style={{ color: colors.navyMuted, fontSize: 12, fontWeight: "800" }}>{tag}</Text>
            </View>
          ))}
        </View>

        {!compact ? (
          <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.sm }}>
            <Ionicons name="time-outline" color={colors.muted} size={17} />
            <Text numberOfLines={1} style={{ color: colors.muted, flex: 1, fontSize: typography.small }}>
              {formatShiftWindow(task.startTime, task.endTime)}
            </Text>
            <Text style={{ color: colors.accent, fontSize: typography.small, fontWeight: "900" }}>
              {spotsLeft || 1} spots left
            </Text>
          </View>
        ) : null}

        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <TouchableOpacity activeOpacity={0.85} style={iconButtonStyle}>
            <Ionicons name="bookmark-outline" color={colors.text} size={19} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.85} style={iconButtonStyle}>
            <Ionicons name="share-social-outline" color={colors.text} size={18} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.86}
            disabled={disabled || applying}
            onPress={() => onApply(task._id)}
            style={{
              alignItems: "center",
              backgroundColor: disabled ? colors.border : colors.accent,
              borderRadius: 999,
              flex: 1,
              flexDirection: "row",
              gap: spacing.xs,
              justifyContent: "center",
              minHeight: 48,
            }}
          >
            {applying ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="flash" size={17} color={disabled ? colors.muted : colors.white} />
                <Text style={{ color: disabled ? colors.muted : colors.white, fontSize: typography.small, fontWeight: "900" }}>
                  Quick Apply
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const badgeStyle = {
  alignItems: "center" as const,
  backgroundColor: "rgba(255,255,255,0.92)",
  borderRadius: 999,
  flexDirection: "row" as const,
  gap: 4,
  paddingHorizontal: 10,
  paddingVertical: 6,
};

const badgeTextStyle = {
  color: colors.text,
  fontSize: 11,
  fontWeight: "900" as const,
};

const iconButtonStyle = {
  alignItems: "center" as const,
  backgroundColor: colors.surface,
  borderRadius: 999,
  height: 48,
  justifyContent: "center" as const,
  width: 48,
};
