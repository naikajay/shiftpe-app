import { useEffect } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import ActiveTaskBanner from "../components/ActiveTaskBanner";
import EmptyState from "../components/EmptyState";
import ScreenHeader from "../components/ScreenHeader";
import TaskCard from "../components/TaskCard";
import TaskCardSkeleton from "../components/TaskCardSkeleton";
import { colors, radius, spacing, typography } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";
import { RootStackParamList } from "../navigation/AppNavigator";

export default function WorkerHomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, logout, loading } = useAuth();
  const {
    activeTask,
    activeRequest,
    tasks,
    loadingTasks,
    refreshing,
    applyingTaskId,
    error,
    loadDashboard,
    refreshDashboard,
    applyForTask,
    markActiveWorkComplete,
  } = useTasks();

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const recommendedTasks = tasks.slice(0, 3);

  return (
    <ScrollView
      style={{ backgroundColor: colors.surface, flex: 1 }}
      contentContainerStyle={{ gap: spacing.lg, padding: spacing.lg, paddingTop: spacing.xl }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshDashboard} tintColor={colors.navy} />
      }
    >
      <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
        <ScreenHeader
          eyebrow="Worker dashboard"
          title={`Hi, ${user?.fullName?.split(" ")[0] ?? "there"}`}
          subtitle="Track your current work and pick up reliable shifts nearby."
        />
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={loading}
          onPress={logout}
          style={{
            alignItems: "center",
            backgroundColor: colors.white,
            borderColor: colors.border,
            borderRadius: 24,
            borderWidth: 1,
            height: 48,
            justifyContent: "center",
            width: 48,
          }}
        >
          <Ionicons name="log-out-outline" color={colors.navy} size={22} />
        </TouchableOpacity>
      </View>

      <ActiveTaskBanner
        task={activeTask}
        completing={loadingTasks}
        onChat={activeRequest ? () => navigation.navigate("Chat", { requestId: activeRequest._id }) : undefined}
        onComplete={activeTask ? markActiveWorkComplete : undefined}
      />

      <View
        style={{
          backgroundColor: colors.white,
          borderColor: colors.border,
          borderRadius: radius.lg,
          borderWidth: 1,
          flexDirection: "row",
          padding: spacing.lg,
        }}
      >
        <View style={{ flex: 1, gap: spacing.xs }}>
          <Text style={{ color: colors.muted, fontSize: typography.small }}>Rating</Text>
          <Text style={{ color: colors.text, fontSize: typography.heading, fontWeight: "900" }}>
            {user?.ratingAverage ?? 0}
          </Text>
        </View>
        <View style={{ backgroundColor: colors.border, width: 1 }} />
        <View style={{ flex: 1, gap: spacing.xs, paddingLeft: spacing.lg }}>
          <Text style={{ color: colors.muted, fontSize: typography.small }}>Reliability</Text>
          <Text style={{ color: colors.text, fontSize: typography.heading, fontWeight: "900" }}>
            {user?.reliabilityScore ?? 0}
          </Text>
        </View>
      </View>

      <View style={{ gap: spacing.md }}>
        <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: colors.text, fontSize: typography.heading, fontWeight: "900" }}>
            Recommended
          </Text>
          <Text style={{ color: colors.muted, fontSize: typography.small }}>
            {tasks.length} open
          </Text>
        </View>

        {error ? (
          <Text style={{ color: colors.danger, fontSize: typography.small }}>{error}</Text>
        ) : null}

        {loadingTasks && !refreshing ? (
          <>
            <TaskCardSkeleton />
            <TaskCardSkeleton />
          </>
        ) : recommendedTasks.length ? (
          recommendedTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              applying={applyingTaskId === task._id}
              disabled={Boolean(activeTask)}
              onApply={applyForTask}
            />
          ))
        ) : (
          <EmptyState
            icon="briefcase-outline"
            title="No open tasks yet"
            message="Pull to refresh. New local gigs will appear here as providers post them."
          />
        )}
      </View>
    </ScrollView>
  );
}
