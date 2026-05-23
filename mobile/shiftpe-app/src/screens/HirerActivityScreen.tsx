import { useEffect, useState } from "react";
import { RefreshControl, Text, View } from "react-native";

import EmptyState from "../components/ui/EmptyState";
import ScreenContainer from "../components/ui/ScreenContainer";
import ScreenIntro from "../components/design/ScreenIntro";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "../theme";
import { tasks } from "../services/tasks";
import { Task } from "../types/task";

export default function HirerActivityScreen() {
  const [providerTasks, setProviderTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTasks = async () => {
    setLoading(true);
    try {
      setProviderTasks(await tasks.getProviderTasks());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <ScreenContainer refreshControl={<RefreshControl refreshing={loading} onRefresh={loadTasks} tintColor={COLORS.primary} />}>
      <ScreenIntro eyebrow="Activity" title="Hiring pipeline" subtitle="Track open, accepted, and completed shifts." />
      {providerTasks.length ? (
        providerTasks.map((task) => (
          <View key={task._id} style={{ backgroundColor: COLORS.white, borderColor: COLORS.border, borderRadius: RADIUS.lg, borderWidth: 1, gap: SPACING.xs, padding: SPACING.md }}>
            <Text style={{ color: COLORS.text, fontSize: TYPOGRAPHY.body, fontWeight: "900" }}>{task.title}</Text>
            <Text style={{ color: COLORS.gray, fontSize: TYPOGRAPHY.small, textTransform: "capitalize" }}>{task.status} • {task.workersJoined}/{task.workersNeeded} workers</Text>
          </View>
        ))
      ) : (
        <EmptyState title="No hiring activity" message="Your posted shifts and applicant flow will show here." icon="albums-outline" />
      )}
    </ScreenContainer>
  );
}
