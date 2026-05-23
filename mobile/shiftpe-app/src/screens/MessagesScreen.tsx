import { useEffect, useState } from "react";
import { RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import EmptyState from "../components/ui/EmptyState";
import Loader from "../components/loaders/Loader";
import ScreenContainer from "../components/ui/ScreenContainer";
import ScreenIntro from "../components/design/ScreenIntro";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "../theme";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../navigation/AppNavigator";
import { tasks } from "../services/tasks";
import { Task, TaskRequest } from "../types/task";

interface ChatPreview {
  request: TaskRequest;
  task: Task | null;
  title: string;
  subtitle: string;
}

export default function MessagesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [previews, setPreviews] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      if (user?.role === "taskProvider") {
        const providerTasks = await tasks.getProviderTasks();
        const applicantGroups = await Promise.all(
          providerTasks.map(async (task) => ({
            task,
            applicants: await tasks.getTaskApplicants(task._id),
          }))
        );

        setPreviews(
          applicantGroups.flatMap(({ task, applicants }) =>
            applicants
              .filter((request) => request.status === "accepted" || request.status === "completed")
              .map((request) => ({
                request,
                task,
                title: getWorkerName(request),
                subtitle: `${task.title} • ${request.status}`,
              }))
          )
        );
        return;
      }

      const requests = await tasks.getWorkerRequests();
      setPreviews(
        requests
          .filter((request) => request.status === "accepted" || request.status === "completed")
          .map((request) => {
            const task = typeof request.taskId === "object" ? request.taskId : null;
            return {
              request,
              task,
              title: task?.title ?? "Accepted shift",
              subtitle: `${request.status} • chat unlocked`,
            };
          })
      );
    } catch (caught: any) {
      setError(caught.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  return (
    <ScreenContainer refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.primary} />}>
      <ScreenIntro eyebrow="Messages" title={user?.role === "taskProvider" ? "Worker chats" : "Employer chats"} subtitle="Chats unlock after a task request is accepted." />

      {error ? <Text style={{ color: COLORS.danger, fontSize: TYPOGRAPHY.small }}>{error}</Text> : null}
      {loading ? <Loader /> : null}

      {!loading && previews.length ? (
        previews.map((preview) => (
          <TouchableOpacity
            key={preview.request._id}
            activeOpacity={0.86}
            onPress={() => navigation.navigate("Chat", { requestId: preview.request._id })}
            style={{ alignItems: "center", backgroundColor: COLORS.white, borderColor: COLORS.border, borderRadius: RADIUS.lg, borderWidth: 1, flexDirection: "row", gap: SPACING.md, padding: SPACING.md }}
          >
            <View style={{ alignItems: "center", backgroundColor: COLORS.primarySoft, borderRadius: 18, height: 54, justifyContent: "center", width: 54 }}>
              <Ionicons name="chatbubble-ellipses-outline" color={COLORS.primary} size={24} />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={{ color: COLORS.text, fontSize: TYPOGRAPHY.body, fontWeight: "900" }}>{preview.title}</Text>
              <Text numberOfLines={1} style={{ color: COLORS.gray, fontSize: TYPOGRAPHY.small }}>{preview.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" color={COLORS.gray} size={20} />
          </TouchableOpacity>
        ))
      ) : null}

      {!loading && !previews.length ? (
        <EmptyState icon="chatbubbles-outline" title="No chats yet" message="Accepted task requests will create chat access here." />
      ) : null}
    </ScreenContainer>
  );
}

function getWorkerName(request: TaskRequest) {
  return typeof request.workerId === "object" ? request.workerId.fullName : "Worker";
}
