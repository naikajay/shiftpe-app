import { useState } from "react";
import { RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import Loader from "../components/loaders/Loader";
import ScreenContainer from "../components/ui/ScreenContainer";
import ScreenIntro from "../components/design/ScreenIntro";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "../theme";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useAuthStore } from "../store/authStore";

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const logout = useAuthStore((state) => state.logout);
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    try {
      await refreshUser();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading && !user) {
    return (
      <ScreenContainer>
        <Loader />
      </ScreenContainer>
    );
  }

  if (!user) {
    return (
      <ScreenContainer refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={COLORS.primary} />}>
        <ScreenIntro eyebrow="Profile" title="Profile unavailable" subtitle="We could not load your backend profile from this session." />
        <EmptyState title="No profile data" message="Login again or pull to refresh your profile." icon="person-circle-outline" />
      </ScreenContainer>
    );
  }

  const skills = user.skills ?? [];
  const hasLocation = Boolean(user.location?.coordinates?.length === 2);

  return (
    <ScreenContainer refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={COLORS.primary} />}>
      <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between" }}>
        <ScreenIntro eyebrow="Profile" title="Your marketplace identity" subtitle="Live profile data from your ShiftPe account." />
        <TouchableOpacity
          activeOpacity={0.86}
          onPress={logout}
          style={{ alignItems: "center", backgroundColor: COLORS.white, borderRadius: RADIUS.pill, height: 46, justifyContent: "center", width: 46 }}
        >
          <Ionicons name="log-out-outline" color={COLORS.text} size={21} />
        </TouchableOpacity>
      </View>

      {error ? <Text style={{ color: COLORS.danger, fontSize: TYPOGRAPHY.small }}>{error}</Text> : null}

      <View style={{ alignItems: "center", backgroundColor: COLORS.white, borderColor: COLORS.border, borderRadius: RADIUS.xl, borderWidth: 1, gap: SPACING.md, padding: SPACING.lg }}>
        <Avatar name={user.fullName} uri={user.profileImage} size={92} />
        <View style={{ alignItems: "center", gap: SPACING.xs }}>
          <Text style={{ color: COLORS.text, fontSize: TYPOGRAPHY.heading, fontWeight: "900" }}>{user.fullName || "Name not set"}</Text>
          <Text style={{ color: COLORS.gray, fontSize: TYPOGRAPHY.small }}>{user.phone || "Phone not available"}</Text>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm, justifyContent: "center" }}>
          <Badge label={user.verified ? "Verified" : "Verification pending"} tone={user.verified ? "success" : "neutral"} />
          <Badge label={user.isAvailable ? "Available" : "Unavailable"} tone={user.isAvailable ? "primary" : "neutral"} />
          <Badge label={user.isWorking ? "Working now" : "Open for work"} tone={user.isWorking ? "success" : "neutral"} />
        </View>
        {user.bio ? (
          <Text style={{ color: COLORS.gray, fontSize: TYPOGRAPHY.small, lineHeight: 20, textAlign: "center" }}>{user.bio}</Text>
        ) : (
          <Text style={{ color: COLORS.gray, fontSize: TYPOGRAPHY.small, lineHeight: 20, textAlign: "center" }}>Bio not added yet</Text>
        )}
      </View>

      <View style={{ flexDirection: "row", gap: SPACING.md }}>
        <Metric label="Hourly rate" value={user.hourlyRate ? formatCurrency(user.hourlyRate) : "Not set" } />
        <Metric label="Reliability" value={user.reliabilityScore !== undefined ? `${user.reliabilityScore}%` : "Not rated"} />
      </View>

      <View style={{ flexDirection: "row", gap: SPACING.md }}>
        <Metric label="Average rating" value={user.ratingAverage ? user.ratingAverage.toFixed(1) : "No ratings"} />
        <Metric label="Completed tasks" value={user.completedTasksCount ? String(user.completedTasksCount) : "None yet"} />
      </View>

      <View style={{ backgroundColor: COLORS.white, borderColor: COLORS.border, borderRadius: RADIUS.lg, borderWidth: 1, gap: SPACING.md, padding: SPACING.md }}>
        <Text style={{ color: COLORS.text, fontSize: TYPOGRAPHY.heading, fontWeight: "900" }}>Skills</Text>
        {skills.length ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm }}>
            {skills.map((skill) => <Badge key={skill} label={skill} tone="primary" />)}
          </View>
        ) : (
          <EmptyState title="No skills added" message="Add skills so matching can recommend better nearby shifts." icon="sparkles-outline" />
        )}
      </View>

      <View style={{ backgroundColor: COLORS.white, borderColor: COLORS.border, borderRadius: RADIUS.lg, borderWidth: 1, gap: SPACING.sm, padding: SPACING.md }}>
        <Text style={{ color: COLORS.text, fontSize: TYPOGRAPHY.heading, fontWeight: "900" }}>Location</Text>
        <Text style={{ color: COLORS.gray, fontSize: TYPOGRAPHY.small }}>
          {hasLocation ? `${user.location?.coordinates[1]}, ${user.location?.coordinates[0]}` : "Location not set"}
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.86}
        onPress={() => navigation.navigate("EditProfile")}
        style={{ alignItems: "center", backgroundColor: COLORS.primary, borderRadius: RADIUS.pill, flexDirection: "row", gap: SPACING.sm, justifyContent: "center", minHeight: 54 }}
      >
        <Ionicons name="create-outline" color={COLORS.white} size={20} />
        <Text style={{ color: COLORS.white, fontSize: TYPOGRAPHY.body, fontWeight: "900" }}>Edit profile</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ backgroundColor: COLORS.white, borderColor: COLORS.border, borderRadius: RADIUS.lg, borderWidth: 1, flex: 1, gap: SPACING.xs, padding: SPACING.md }}>
      <Text style={{ color: COLORS.gray, fontSize: TYPOGRAPHY.small, fontWeight: "800" }}>{label}</Text>
      <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: "900" }}>{value}</Text>
    </View>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}
