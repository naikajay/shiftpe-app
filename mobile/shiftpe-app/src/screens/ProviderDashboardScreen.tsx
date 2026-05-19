import { useEffect, useState } from "react";
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import AppButton from "../components/AppButton";
import AppTextInput from "../components/AppTextInput";
import EmptyState from "../components/EmptyState";
import ErrorMessage from "../components/ErrorMessage";
import ScreenHeader from "../components/ScreenHeader";
import { colors, radius, spacing, typography } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../navigation/AppNavigator";
import { tasks } from "../services/tasks";
import { Payment, Task, TaskRequest } from "../types/task";

const tomorrowIso = (hoursFromNow: number) =>
  new Date(Date.now() + hoursFromNow * 60 * 60 * 1000).toISOString();

const getWorkerName = (request: TaskRequest) =>
  typeof request.workerId === "object" ? request.workerId.fullName : "Worker";

const getWorkerId = (request: TaskRequest) =>
  typeof request.workerId === "object" ? request.workerId._id : request.workerId;

export default function ProviderDashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, logout, loading: authLoading } = useAuth();
  const [providerTasks, setProviderTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<TaskRequest[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [workersNeeded, setWorkersNeeded] = useState("1");
  const [address, setAddress] = useState("");
  const [longitude, setLongitude] = useState("");
  const [latitude, setLatitude] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const [nextTasks, nextPayments, nearbyWorkers] = await Promise.all([
        tasks.getProviderTasks(),
        tasks.getPayments(),
        tasks.getNearbyWorkers(
          user?.location?.coordinates
            ? {
                longitude: user.location.coordinates[0],
                latitude: user.location.coordinates[1],
                radiusKm: 25,
                limit: 10,
              }
            : { limit: 10 }
        ),
      ]);
      setProviderTasks(nextTasks);
      setPayments(nextPayments);
      setWorkers(nearbyWorkers);
      const taskId = selectedTaskId || nextTasks[0]?._id || null;
      setSelectedTaskId(taskId);
      setApplicants(taskId ? await tasks.getTaskApplicants(taskId) : []);
    } catch (caught: any) {
      setError(caught.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createTask = async () => {
    try {
      setLoading(true);
      setError(null);
      const created = await tasks.createTask({
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        payAmount: Number(payAmount),
        payType: "fixed",
        workersNeeded: Number(workersNeeded || 1),
        startTime: tomorrowIso(1),
        endTime: tomorrowIso(4),
        location: {
          type: "Point",
          coordinates: [Number(longitude), Number(latitude)],
        },
        address: address.trim(),
      });
      setTitle("");
      setDescription("");
      setCategory("");
      setPayAmount("");
      setAddress("");
      setSelectedTaskId(created._id);
      await loadDashboard();
      Alert.alert("Task", "Task posted.");
    } catch (caught: any) {
      setError(caught.message);
    } finally {
      setLoading(false);
    }
  };

  const selectTask = async (taskId: string) => {
    setSelectedTaskId(taskId);
    setApplicants(await tasks.getTaskApplicants(taskId));
  };

  const accept = async (requestId: string) => {
    await tasks.acceptTaskRequest(requestId);
    await loadDashboard();
  };

  const pendingPayments = payments.filter((payment) => payment.paymentStatus === "pending");
  const completedApplicants = applicants.filter((request) => request.status === "completed");

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface }}
      contentContainerStyle={{ gap: spacing.lg, padding: spacing.lg, paddingTop: spacing.xl }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadDashboard} />}
    >
      <ScreenHeader
        eyebrow="Customer dashboard"
        title={`Hi, ${user?.fullName?.split(" ")[0] ?? "there"}`}
        subtitle="Post work, approve workers, chat, pay, and rate completed jobs."
      />

      <ErrorMessage message={error} />

      <View style={{ backgroundColor: colors.white, borderRadius: radius.lg, gap: spacing.md, padding: spacing.lg }}>
        <Text style={{ color: colors.text, fontSize: typography.heading, fontWeight: "900" }}>
          Post a task
        </Text>
        <AppTextInput label="Title" value={title} onChangeText={setTitle} />
        <AppTextInput label="Description" value={description} onChangeText={setDescription} multiline />
        <AppTextInput label="Category" value={category} onChangeText={setCategory} />
        <AppTextInput label="Pay amount" value={payAmount} onChangeText={setPayAmount} keyboardType="numeric" />
        <AppTextInput label="Workers needed" value={workersNeeded} onChangeText={setWorkersNeeded} keyboardType="numeric" />
        <AppTextInput label="Address" value={address} onChangeText={setAddress} />
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <AppTextInput label="Longitude" value={longitude} onChangeText={setLongitude} keyboardType="numeric" style={{ flex: 1 }} />
          <AppTextInput label="Latitude" value={latitude} onChangeText={setLatitude} keyboardType="numeric" style={{ flex: 1 }} />
        </View>
        <AppButton label="Post task" onPress={createTask} loading={loading} />
      </View>

      <View style={{ gap: spacing.md }}>
        <Text style={{ color: colors.text, fontSize: typography.heading, fontWeight: "900" }}>
          Your tasks
        </Text>
        {providerTasks.length ? (
          providerTasks.map((task) => (
            <TouchableOpacity
              key={task._id}
              onPress={() => selectTask(task._id)}
              style={{
                backgroundColor: selectedTaskId === task._id ? colors.navy : colors.white,
                borderRadius: radius.md,
                padding: spacing.md,
              }}
            >
              <Text style={{ color: selectedTaskId === task._id ? colors.white : colors.text, fontWeight: "900" }}>
                {task.title}
              </Text>
              <Text style={{ color: selectedTaskId === task._id ? colors.white : colors.muted }}>
                {task.status} - {task.workersJoined}/{task.workersNeeded} workers
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <EmptyState icon="briefcase-outline" title="No tasks posted" message="Create your first task above." />
        )}
      </View>

      <View style={{ gap: spacing.md }}>
        <Text style={{ color: colors.text, fontSize: typography.heading, fontWeight: "900" }}>
          Applicants
        </Text>
        {applicants.length ? (
          applicants.map((request) => (
            <View key={request._id} style={{ backgroundColor: colors.white, borderRadius: radius.md, gap: spacing.sm, padding: spacing.md }}>
              <Text style={{ color: colors.text, fontWeight: "900" }}>{getWorkerName(request)}</Text>
              <Text style={{ color: colors.muted }}>{request.status}</Text>
              {request.status === "pending" ? (
                <AppButton label="Approve request" onPress={() => accept(request._id)} />
              ) : null}
              {request.status === "accepted" || request.status === "completed" ? (
                <AppButton
                  label="Chat"
                  variant="secondary"
                  onPress={() => navigation.navigate("Chat", { requestId: request._id })}
                />
              ) : null}
            </View>
          ))
        ) : (
          <EmptyState icon="people-outline" title="No applicants yet" message="Worker requests will appear here." />
        )}
      </View>

      <View style={{ gap: spacing.md }}>
        <Text style={{ color: colors.text, fontSize: typography.heading, fontWeight: "900" }}>
          Payments
        </Text>
        {pendingPayments.length ? (
          pendingPayments.map((payment) => (
            <View key={payment._id} style={{ backgroundColor: colors.white, borderRadius: radius.md, gap: spacing.sm, padding: spacing.md }}>
              <Text style={{ color: colors.text, fontWeight: "900" }}>INR {payment.amount}</Text>
              <AppButton label="Mark paid" onPress={async () => { await tasks.markPaymentPaid(payment._id); await loadDashboard(); }} />
            </View>
          ))
        ) : (
          <EmptyState icon="wallet-outline" title="No pending payments" message="Completed work will create payable items." />
        )}
      </View>

      {completedApplicants.length ? (
        <View style={{ gap: spacing.md }}>
          <Text style={{ color: colors.text, fontSize: typography.heading, fontWeight: "900" }}>
            Rate workers
          </Text>
          {completedApplicants.map((request) => (
            <AppButton
              key={request._id}
              label={`Rate ${getWorkerName(request)} 5 stars`}
              onPress={async () => {
                await tasks.rateWorker({
                  taskId: typeof request.taskId === "object" ? request.taskId._id : request.taskId,
                  toUserId: getWorkerId(request),
                  score: 5,
                  review: "Great work.",
                });
                Alert.alert("Rating", "Rating submitted.");
              }}
            />
          ))}
        </View>
      ) : null}

      <View style={{ gap: spacing.md }}>
        <Text style={{ color: colors.text, fontSize: typography.heading, fontWeight: "900" }}>
          Nearby workers
        </Text>
        {workers.length ? (
          workers.map((worker) => (
            <View key={worker._id} style={{ backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md }}>
              <Text style={{ color: colors.text, fontWeight: "900" }}>{worker.fullName}</Text>
              <Text style={{ color: colors.muted }}>{worker.skills?.join(", ") || "No skills listed"}</Text>
            </View>
          ))
        ) : (
          <EmptyState icon="location-outline" title="No nearby workers" message="Add your location or try again later." />
        )}
      </View>

      <AppButton label="Logout" onPress={logout} loading={authLoading} variant="secondary" />
    </ScrollView>
  );
}
