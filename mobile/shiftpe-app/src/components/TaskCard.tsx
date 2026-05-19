import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../constants/theme";
import { Task } from "../types/task";

interface TaskCardProps {
  task: Task;
  onApply: (taskId: string) => void;
  applying?: boolean;
  disabled?: boolean;
}

const formatPay = (task: Task) => {
  const amount = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  }).format(task.payAmount);

  return task.payType === "fixed" ? amount : `${amount}/${task.payType}`;
};

const formatDistance = (distanceMeters?: number) => {
  if (distanceMeters === undefined) return null;
  if (distanceMeters < 1000) return `${Math.round(distanceMeters)} m away`;
  return `${(distanceMeters / 1000).toFixed(1)} km away`;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

export default function TaskCard({ task, onApply, applying = false, disabled = false }: TaskCardProps) {
  const distance = formatDistance(task.distanceMeters);
  const spotsLeft = Math.max(task.workersNeeded - task.workersJoined, 0);

  return (
    <View
      style={{
        backgroundColor: colors.white,
        borderColor: colors.border,
        borderRadius: radius.lg,
        borderWidth: 1,
        padding: spacing.lg,
        gap: spacing.md,
      }}
    >
      <View style={{ gap: spacing.sm }}>
        <View style={{ alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
          <View style={{ flex: 1, gap: spacing.xs }}>
            <Text style={{ color: colors.text, fontSize: typography.heading, fontWeight: "900" }}>
              {task.title}
            </Text>
            <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 18 }}>
              {task.category}
            </Text>
          </View>
          <Text style={{ color: colors.success, fontSize: typography.body, fontWeight: "900" }}>
            {formatPay(task)}
          </Text>
        </View>

        <Text numberOfLines={2} style={{ color: colors.muted, fontSize: typography.small, lineHeight: 20 }}>
          {task.description}
        </Text>
      </View>

      <View style={{ gap: spacing.sm }}>
        <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.sm }}>
          <Ionicons name="location-outline" size={17} color={colors.navyMuted} />
          <Text numberOfLines={1} style={{ color: colors.text, flex: 1, fontSize: typography.small }}>
            {distance ? `${distance} - ${task.address}` : task.address}
          </Text>
        </View>
        <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.sm }}>
          <Ionicons name="time-outline" size={17} color={colors.navyMuted} />
          <Text style={{ color: colors.text, fontSize: typography.small }}>
            {formatDate(task.startTime)}
          </Text>
        </View>
        <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.sm }}>
          <Ionicons name="people-outline" size={17} color={colors.navyMuted} />
          <Text style={{ color: colors.text, fontSize: typography.small }}>
            {spotsLeft} spot{spotsLeft === 1 ? "" : "s"} left
          </Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.86}
        disabled={disabled || applying}
        onPress={() => onApply(task._id)}
        style={{
          alignItems: "center",
          backgroundColor: disabled ? colors.border : colors.navy,
          borderRadius: radius.md,
          flexDirection: "row",
          gap: spacing.sm,
          justifyContent: "center",
          minHeight: 48,
          paddingHorizontal: spacing.md,
        }}
      >
        {applying ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <>
            <Ionicons name="send" size={17} color={disabled ? colors.muted : colors.white} />
            <Text
              style={{
                color: disabled ? colors.muted : colors.white,
                fontSize: typography.body,
                fontWeight: "800",
              }}
            >
              Apply
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
