import { useEffect, useState } from "react";
import { Alert, RefreshControl, Switch, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import ActiveTaskBanner from "../components/ActiveTaskBanner";
import ScreenContainer from "../components/ui/ScreenContainer";
import ScreenIntro from "../components/design/ScreenIntro";
import TaskCard from "../components/cards/TaskCard";
import EmptyState from "../components/ui/EmptyState";
import Loader from "../components/loaders/Loader";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "../theme";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";
import { RootStackParamList } from "../navigation/AppNavigator";
import { tasks as taskService } from "../services/tasks";
import { Task } from "../types/task";
import { formatPay, formatShiftWindow } from "../utils/shiftUi";

export default function WorkerHomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const {
    activeTask,
    activeRequest,
    tasks,
    recommendedTasks,
    loadingTasks,
    refreshing,
    applyingTaskId,
    error,
    loadDashboard,
    refreshDashboard,
    applyForTask,
    markActiveWorkComplete,
  } = useTasks();
  const [available, setAvailable] = useState(user?.isAvailable ?? true);
  const [savingAvailability, setSavingAvailability] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const firstName = user?.fullName?.split(" ")[0] || "there";
  const greeting = getGreeting();
  const openDetails = (task: Task) => navigation.navigate("JobDetails", { task });

  const updateAvailability = async (value: boolean) => {
    setAvailable(value);
    setSavingAvailability(true);
    try {
      await taskService.updateProfile({ isAvailable: value });
    } catch (caught: any) {
      setAvailable(!value);
      Alert.alert("Availability", caught.message);
    } finally {
      setSavingAvailability(false);
    }
  };

  return (
    <ScreenContainer
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshDashboard} tintColor={COLORS.primary} />}
    >
      <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between" }}>
        <ScreenIntro
          eyebrow="Worker home"
          title={`${greeting}, ${firstName}`}
          subtitle={`${tasks.length} new nearby shift${tasks.length === 1 ? "" : "s"} ready to explore.`}
        />
        <View style={{ alignItems: "center", backgroundColor: COLORS.white, borderRadius: RADIUS.pill, height: 46, justifyContent: "center", width: 46 }}>
          <Ionicons name="notifications-outline" color={COLORS.text} size={21} />
        </View>
      </View>

      <View style={{ alignItems: "center", backgroundColor: COLORS.white, borderColor: COLORS.border, borderRadius: RADIUS.xl, borderWidth: 1, flexDirection: "row", gap: SPACING.md, padding: SPACING.md }}>
        <View style={{ alignItems: "center", backgroundColor: available ? COLORS.successSoft : COLORS.background, borderRadius: 18, height: 54, justifyContent: "center", width: 54 }}>
          <Ionicons name={available ? "radio" : "moon-outline"} color={available ? COLORS.success : COLORS.gray} size={24} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: COLORS.text, fontSize: TYPOGRAPHY.body, fontWeight: "900" }}>
            {available ? "Available for instant shifts" : "Not taking shifts"}
          </Text>
          <Text style={{ color: COLORS.gray, fontSize: TYPOGRAPHY.small }}>
            {savingAvailability ? "Updating status..." : "Live hirers see this status first"}
          </Text>
        </View>
        <Switch value={available} onValueChange={updateAvailability} thumbColor={available ? COLORS.primary : COLORS.white} />
      </View>

      <View style={{ flexDirection: "row", gap: SPACING.md }}>
        <Metric label="Top nearby pay" value={tasks[0] ? formatPay(tasks[0]) : "No open shifts"} />
        <Metric label="Recommended" value={`${recommendedTasks.length}`} />
      </View>

      <SectionTitle title="Active Task" action={activeTask ? "Live" : "Ready"} />
      <ActiveTaskBanner
        task={activeTask}
        completing={loadingTasks}
        onChat={activeRequest ? () => navigation.navigate("Chat", { requestId: activeRequest._id }) : undefined}
        onComplete={activeTask ? markActiveWorkComplete : undefined}
      />

      <SectionTitle title="Nearby Tasks" action={`${tasks.length} open`} />
      {error ? <Text style={{ color: COLORS.danger, fontSize: TYPOGRAPHY.small }}>{error}</Text> : null}
      {loadingTasks && !refreshing ? (
        <Loader />
      ) : tasks.length ? (
        tasks.slice(0, 3).map((task, index) => (
          <TaskCard
            key={task._id}
            task={task}
            index={index}
            applying={applyingTaskId === task._id}
            disabled={Boolean(activeTask)}
            onApply={applyForTask}
            onPress={openDetails}
          />
        ))
      ) : (
        <EmptyState title="No nearby shifts" message="Pull to refresh. New local shifts appear here in real time." icon="briefcase-outline" />
      )}

      <SectionTitle title="Recommended Tasks" action="AI matched" />
      {recommendedTasks.length ? (
        recommendedTasks.slice(0, 3).map((task, index) => (
          <CompactTask key={task._id} task={task} onPress={() => openDetails(task)} />
        ))
      ) : (
        <EmptyState title="No recommendations yet" message="Add skills in Profile to improve task matching." icon="sparkles-outline" />
      )}

      <SectionTitle title="Recent Activity" action="Realtime" />
      <View style={{ backgroundColor: COLORS.white, borderColor: COLORS.border, borderRadius: RADIUS.lg, borderWidth: 1, gap: SPACING.sm, padding: SPACING.md }}>
        <Text style={{ color: COLORS.text, fontSize: TYPOGRAPHY.body, fontWeight: "900" }}>
          {activeRequest ? "Accepted shift in progress" : "No accepted shift yet"}
        </Text>
        <Text style={{ color: COLORS.gray, fontSize: TYPOGRAPHY.small, lineHeight: 20 }}>
          {activeRequest ? "Chat with the hirer, complete the work, then collect payout and rating." : "Swipe or Quick Apply to start your next ShiftPe flow."}
        </Text>
      </View>
    </ScreenContainer>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ backgroundColor: COLORS.white, borderColor: COLORS.border, borderRadius: RADIUS.lg, borderWidth: 1, flex: 1, gap: SPACING.xs, padding: SPACING.md }}>
      <Text style={{ color: COLORS.gray, fontSize: TYPOGRAPHY.small, fontWeight: "800" }}>{label}</Text>
      <Text style={{ color: COLORS.text, fontSize: 22, fontWeight: "900" }}>{value}</Text>
    </View>
  );
}

function SectionTitle({ title, action }: { title: string; action: string }) {
  return (
    <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={{ color: COLORS.text, fontSize: TYPOGRAPHY.heading, fontWeight: "900" }}>{title}</Text>
      <Text style={{ color: COLORS.primary, fontSize: TYPOGRAPHY.small, fontWeight: "900" }}>{action}</Text>
    </View>
  );
}

function CompactTask({ task, onPress }: { task: Task; onPress: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      style={{ alignItems: "center", backgroundColor: COLORS.white, borderColor: COLORS.border, borderRadius: RADIUS.lg, borderWidth: 1, flexDirection: "row", gap: SPACING.md, padding: SPACING.md }}
    >
      <View style={{ alignItems: "center", backgroundColor: COLORS.primarySoft, borderRadius: 16, height: 50, justifyContent: "center", width: 50 }}>
        <Ionicons name="flash" color={COLORS.primary} size={22} />
      </View>
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={{ color: COLORS.text, fontSize: TYPOGRAPHY.body, fontWeight: "900" }}>{task.title}</Text>
        <Text numberOfLines={1} style={{ color: COLORS.gray, fontSize: TYPOGRAPHY.small }}>{task.category} - {formatShiftWindow(task.startTime, task.endTime)}</Text>
      </View>
      <Text style={{ color: COLORS.success, fontSize: TYPOGRAPHY.body, fontWeight: "900" }}>{formatPay(task)}</Text>
    </TouchableOpacity>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}
