import { useEffect } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";

import ActiveTaskBanner from "../components/ActiveTaskBanner";
import EmptyState from "../components/EmptyState";
import ScreenHeader from "../components/ScreenHeader";
import TaskCard from "../components/TaskCard";
import TaskCardSkeleton from "../components/TaskCardSkeleton";
import { colors, spacing, typography } from "../constants/theme";
import { useTasks } from "../context/TaskContext";
import { Task } from "../types/task";

export default function ExploreTasksScreen() {
  const {
    activeTask,
    tasks,
    loadingTasks,
    refreshing,
    applyingTaskId,
    error,
    loadDashboard,
    refreshDashboard,
    applyForTask,
  } = useTasks();

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const renderTask = ({ item }: { item: Task }) => (
    <TaskCard
      task={item}
      applying={applyingTaskId === item._id}
      disabled={Boolean(activeTask)}
      onApply={applyForTask}
    />
  );

  return (
    <FlatList
      style={{ backgroundColor: colors.surface, flex: 1 }}
      data={loadingTasks && !refreshing ? [] : tasks}
      keyExtractor={(item) => item._id}
      renderItem={renderTask}
      ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshDashboard} tintColor={colors.navy} />
      }
      contentContainerStyle={{
        flexGrow: 1,
        gap: spacing.lg,
        padding: spacing.lg,
        paddingTop: spacing.xl,
      }}
      ListHeaderComponent={
        <View style={{ gap: spacing.lg }}>
          <ScreenHeader
            eyebrow="Explore tasks"
            title="Open shifts nearby"
            subtitle="Browse live tasks that are still open and apply when you are available."
          />
          <ActiveTaskBanner task={activeTask} />
          {error ? (
            <Text style={{ color: colors.danger, fontSize: typography.small }}>{error}</Text>
          ) : null}
          {loadingTasks && !refreshing ? (
            <View style={{ gap: spacing.md }}>
              <TaskCardSkeleton />
              <TaskCardSkeleton />
              <TaskCardSkeleton />
            </View>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        loadingTasks && !refreshing ? null : (
          <EmptyState
            icon="search-outline"
            title="No nearby tasks"
            message="Try again shortly. Explore only shows open tasks with available worker slots."
          />
        )
      }
    />
  );
}
