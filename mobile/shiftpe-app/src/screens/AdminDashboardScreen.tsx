import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";

import AppButton from "../components/AppButton";
import EmptyState from "../components/EmptyState";
import ErrorMessage from "../components/ErrorMessage";
import ScreenHeader from "../components/ScreenHeader";
import { colors, radius, spacing, typography } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { admin } from "../services/admin";

export default function AdminDashboardScreen() {
  const { logout } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersData, tasksData, paymentsData, verificationData] = await Promise.all([
        admin.listUsers(),
        admin.listTasks(),
        admin.listPayments(),
        admin.listVerifications(),
      ]);
      setUsers(usersData.users ?? []);
      setTasks(tasksData.tasks ?? []);
      setPayments(paymentsData.payments ?? []);
      setVerifications(verificationData.verifications ?? []);
    } catch (caught: any) {
      setError(caught.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <ScrollView
      style={{ backgroundColor: colors.surface, flex: 1 }}
      contentContainerStyle={{ gap: spacing.lg, padding: spacing.lg, paddingTop: spacing.xl }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      <ScreenHeader
        eyebrow="Admin"
        title="Operations dashboard"
        subtitle="Review users, tasks, payments, and worker verification."
      />
      <ErrorMessage message={error} />

      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        {[
          ["Users", users.length],
          ["Tasks", tasks.length],
          ["Payments", payments.length],
          ["KYC", verifications.length],
        ].map(([label, value]) => (
          <View key={label} style={{ backgroundColor: colors.white, borderRadius: radius.md, flex: 1, padding: spacing.md }}>
            <Text style={{ color: colors.muted, fontSize: typography.small }}>{label}</Text>
            <Text style={{ color: colors.text, fontSize: typography.heading, fontWeight: "900" }}>{value}</Text>
          </View>
        ))}
      </View>

      <Text style={{ color: colors.text, fontSize: typography.heading, fontWeight: "900" }}>
        Pending verifications
      </Text>
      {verifications.filter((item) => item.status === "pending").length ? (
        verifications
          .filter((item) => item.status === "pending")
          .map((item) => (
            <View key={item._id} style={{ backgroundColor: colors.white, borderRadius: radius.md, gap: spacing.sm, padding: spacing.md }}>
              <Text style={{ color: colors.text, fontWeight: "900" }}>
                {item.userId?.fullName ?? "Worker"} - {item.documentType}
              </Text>
              <Text style={{ color: colors.muted }}>{item.documentUrl}</Text>
              <View style={{ flexDirection: "row", gap: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <AppButton label="Approve" onPress={async () => { await admin.updateVerification(item._id, "approved"); await load(); }} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppButton label="Reject" variant="danger" onPress={async () => { await admin.updateVerification(item._id, "rejected"); await load(); }} />
                </View>
              </View>
            </View>
          ))
      ) : (
        <EmptyState icon="shield-checkmark-outline" title="No pending KYC" message="Worker verification requests will appear here." />
      )}

      <AppButton label="Logout" variant="secondary" onPress={logout} />
    </ScrollView>
  );
}
