import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import EmptyState from "../components/EmptyState";
import { colors, radius, spacing, typography } from "../constants/theme";
import { tasks } from "../services/tasks";
import { TaskRequest } from "../types/task";
import { formatPay, formatShiftWindow } from "../utils/shiftUi";

export default function AppliedScreen() {
  const [requests, setRequests] = useState<TaskRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeStatus, setActiveStatus] = useState<TaskRequest["status"] | "all">("all");

  const load = async () => {
    try {
      setLoading(true);
      setRequests(await tasks.getWorkerRequests(activeStatus === "all" ? undefined : activeStatus));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStatus]);

  return (
    <ScrollView
      style={{ backgroundColor: colors.surface, flex: 1 }}
      contentContainerStyle={{ gap: spacing.lg, padding: spacing.lg, paddingBottom: 112, paddingTop: spacing.xl }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.accent} />}
      showsVerticalScrollIndicator={false}
    >
      <View>
        <Text style={{ color: colors.muted, fontSize: typography.small, fontWeight: "800" }}>Applications</Text>
        <Text style={{ color: colors.text, fontSize: 28, fontWeight: "900" }}>Your shift pipeline</Text>
      </View>

      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        {(["all", "pending", "accepted", "completed"] as const).map((status) => {
          const active = activeStatus === status;
          return (
            <TouchableOpacity
              key={status}
              activeOpacity={0.86}
              onPress={() => setActiveStatus(status)}
              style={{ backgroundColor: active ? colors.accent : colors.white, borderRadius: 999, flex: 1, paddingVertical: spacing.sm }}
            >
              <Text style={{ color: active ? colors.white : colors.text, fontSize: 12, fontWeight: "900", textAlign: "center", textTransform: "capitalize" }}>
                {status}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {requests.length ? (
        requests.map((request) => {
          const task = typeof request.taskId === "object" ? request.taskId : null;
          return (
            <View key={request._id} style={{ backgroundColor: colors.white, borderRadius: radius.lg, gap: spacing.md, padding: spacing.md }}>
              <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.md }}>
                <View style={{ alignItems: "center", backgroundColor: colors.successSoft, borderRadius: 16, height: 50, justifyContent: "center", width: 50 }}>
                  <Ionicons name={request.status === "accepted" ? "checkmark" : "time-outline"} color={colors.success} size={24} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontSize: typography.body, fontWeight: "900" }}>{task?.title ?? "Shift request"}</Text>
                  <Text style={{ color: colors.muted, fontSize: typography.small, textTransform: "capitalize" }}>{request.status}</Text>
                </View>
                {task ? <Text style={{ color: colors.success, fontSize: typography.body, fontWeight: "900" }}>{formatPay(task)}</Text> : null}
              </View>
              {task ? (
                <Text style={{ color: colors.muted, fontSize: typography.small }}>{formatShiftWindow(task.startTime, task.endTime)}</Text>
              ) : null}
            </View>
          );
        })
      ) : (
        <EmptyState icon="albums-outline" title="No applications yet" message="Quick Apply from Home and your requests will show up here." />
      )}
    </ScrollView>
  );
}
