import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../constants/theme";
import { Task } from "../types/task";

interface ActiveTaskBannerProps {
  task: Task | null;
  onComplete?: () => void;
  onChat?: () => void;
  completing?: boolean;
}

const formatTime = (value?: string) => {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

export default function ActiveTaskBanner({ task, onComplete, onChat, completing = false }: ActiveTaskBannerProps) {
  return (
    <View
      style={{
        backgroundColor: task ? colors.text : colors.white,
        borderColor: task ? colors.text : colors.border,
        borderRadius: radius.lg,
        borderWidth: 1,
        padding: spacing.lg,
        gap: spacing.sm,
      }}
    >
      <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.sm }}>
        <Ionicons
          name={task ? "flash" : "checkmark-circle"}
          size={22}
          color={task ? colors.white : colors.success}
        />
        <Text
          style={{
            color: task ? colors.white : colors.text,
            fontSize: typography.body,
            fontWeight: "900",
          }}
        >
          {task ? "Active task" : "Available for work"}
        </Text>
      </View>

      <Text
        style={{
          color: task ? colors.white : colors.muted,
          fontSize: typography.small,
          lineHeight: 19,
        }}
      >
        {task
          ? `${task.title} starts ${formatTime(task.startTime)} at ${task.address}`
          : "You can apply to open tasks nearby. Accepted work will appear here."}
      </Text>

      {task && onComplete ? (
        <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs }}>
          {onChat ? (
            <TouchableOpacity
              activeOpacity={0.86}
              onPress={onChat}
              style={{
                alignItems: "center",
                backgroundColor: colors.white,
                borderRadius: radius.md,
                flex: 1,
                minHeight: 44,
                justifyContent: "center",
              }}
            >
              <Text style={{ color: colors.accent, fontSize: typography.small, fontWeight: "900" }}>
                Chat
              </Text>
            </TouchableOpacity>
          ) : null}
        <TouchableOpacity
          activeOpacity={0.86}
          disabled={completing}
          onPress={onComplete}
          style={{
            alignItems: "center",
            backgroundColor: colors.white,
            borderRadius: radius.md,
            flex: 1,
            minHeight: 44,
            justifyContent: "center",
          }}
        >
          <Text style={{ color: colors.accent, fontSize: typography.small, fontWeight: "900" }}>
            {completing ? "Updating..." : "Mark work complete"}
          </Text>
        </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}
