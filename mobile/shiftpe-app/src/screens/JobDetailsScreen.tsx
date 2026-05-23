import { useState } from "react";
import { ActivityIndicator, Alert, ImageBackground, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { colors, radius, spacing, typography } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../navigation/AppNavigator";
import { tasks } from "../services/tasks";
import { formatDistance, formatPay, formatShiftWindow, getCompanyName, getMatchScore, getShiftImage, getTags } from "../utils/shiftUi";

type Props = NativeStackScreenProps<RootStackParamList, "JobDetails">;

export default function JobDetailsScreen({ navigation, route }: Props) {
  const { task } = route.params;
  const { user } = useAuth();
  const [applying, setApplying] = useState(false);
  const spotsLeft = Math.max(task.workersNeeded - task.workersJoined, 0);
  const match = getMatchScore(task);
  const company = getCompanyName(task);
  const provider = typeof task.taskProviderId === "object" ? task.taskProviderId : null;
  const durationHours = Math.max(
    0,
    (new Date(task.endTime).getTime() - new Date(task.startTime).getTime()) / (1000 * 60 * 60)
  );
  const estimatedPay =
    task.payType === "hourly"
      ? task.payAmount * durationHours
      : task.payAmount;

  const apply = async () => {
    if (user?.isWorking) {
      Alert.alert("Active shift", "Complete your current shift before requesting another one.");
      return;
    }

    try {
      setApplying(true);
      await tasks.applyForTask(task._id);
      Alert.alert("Requested", "Your request to join was sent to the hirer.");
      navigation.goBack();
    } catch (caught: any) {
      Alert.alert("Apply failed", caught.message);
    } finally {
      setApplying(false);
    }
  };

  return (
    <View style={{ backgroundColor: colors.white, flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 116 }} showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={{ uri: getShiftImage(task) }}
          style={{ height: 330, justifyContent: "space-between", padding: spacing.lg, paddingTop: 56 }}
          imageStyle={{ borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={navigation.goBack}
              style={circleButtonStyle}
            >
              <Ionicons name="chevron-back" color={colors.text} size={24} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85} style={circleButtonStyle}>
              <Ionicons name="share-social-outline" color={colors.text} size={21} />
            </TouchableOpacity>
          </View>

          <View style={{ gap: spacing.sm }}>
            <View style={{ alignSelf: "flex-start", backgroundColor: "rgba(17,17,17,0.72)", borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: spacing.xs }}>
              <Text style={{ color: colors.white, fontSize: typography.small, fontWeight: "800" }}>
                High demand • {spotsLeft || 1} spots left
              </Text>
            </View>
            <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.sm }}>
              <View style={{ alignItems: "center", backgroundColor: colors.white, borderRadius: 18, height: 54, justifyContent: "center", width: 54 }}>
                <Text style={{ color: colors.accent, fontSize: 22, fontWeight: "900" }}>{company.charAt(0)}</Text>
              </View>
              <View>
                <Text style={{ color: colors.white, fontSize: typography.body, fontWeight: "900" }}>{company}</Text>
                <Text style={{ color: colors.white, fontSize: typography.small }}>
                  {provider?.ratingAverage ? `${provider.ratingAverage.toFixed(1)} rating` : "Rating pending"} • {provider?.verified ? "Verified employer" : "Verification pending"}
                </Text>
              </View>
            </View>
          </View>
        </ImageBackground>

        <View style={{ gap: spacing.lg, padding: spacing.lg }}>
          <View style={{ gap: spacing.sm }}>
            <Text style={{ color: colors.text, fontSize: 30, fontWeight: "900", lineHeight: 36 }}>{task.title}</Text>
            <Text style={{ color: colors.muted, fontSize: typography.body }}>
              {task.address} • {formatDistance(task.distanceMeters)}
            </Text>
          </View>

          <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: radius.lg, flexDirection: "row", gap: spacing.md, padding: spacing.md }}>
            <Metric label="Hourly rate" value={formatPay(task)} tone="green" />
            <Metric label="Shift est." value={formatCurrency(estimatedPay)} />
            <Metric label="Match" value={`${match}%`} />
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            {getTags(task).map((tag) => (
              <View key={tag} style={{ backgroundColor: colors.accentSoft, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: spacing.xs }}>
                <Text style={{ color: colors.accent, fontSize: typography.small, fontWeight: "800" }}>{tag}</Text>
              </View>
            ))}
          </View>

          <View style={{ backgroundColor: colors.white, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, gap: spacing.sm, padding: spacing.md }}>
            <Text style={{ color: colors.text, fontSize: typography.body, fontWeight: "900" }}>About</Text>
            <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 21 }}>{task.description}</Text>
          </View>

          <View style={{ gap: spacing.md }}>
            <Text style={{ color: colors.text, fontSize: typography.heading, fontWeight: "900" }}>Requirements</Text>
            <InfoCard icon="calendar-outline" title="Date and time" body={formatShiftWindow(task.startTime, task.endTime)} />
            <InfoCard icon="shirt-outline" title="Dress code" body="Clean casuals, closed shoes preferred" />
            <InfoCard icon="flash-outline" title="AI match insight" body={`You match ${match}% because your skills line up with ${task.category || "this"} shifts nearby.`} />
          </View>

          <View style={{ gap: spacing.md }}>
            <Text style={{ color: colors.text, fontSize: typography.heading, fontWeight: "900" }}>Pay</Text>
            <InfoCard icon="wallet-outline" title={formatPay(task)} body="Paid instantly after the hirer marks the shift complete" />
            <InfoCard icon="gift-outline" title="Bonus potential" body="High-demand shifts may include incentives after completion" />
          </View>

          <View style={{ gap: spacing.md }}>
            <Text style={{ color: colors.text, fontSize: typography.heading, fontWeight: "900" }}>Location</Text>
            <InfoCard icon="location-outline" title={task.address} body={`${formatDistance(task.distanceMeters)} • exact pin unlocks after acceptance`} />
          </View>

          <View style={{ gap: spacing.md }}>
            <Text style={{ color: colors.text, fontSize: typography.heading, fontWeight: "900" }}>Employer</Text>
            <InfoCard
              icon="business-outline"
              title={company}
              body={`${provider?.verified ? "Verified hirer" : "Verification pending"} • ${provider?.ratingAverage ? `${provider.ratingAverage.toFixed(1)} rating` : "No ratings yet"}`}
            />
          </View>

          <View style={{ gap: spacing.md }}>
            <Text style={{ color: colors.text, fontSize: typography.heading, fontWeight: "900" }}>Reviews</Text>
            <InfoCard
              icon="star-outline"
              title={provider?.ratingAverage ? `${provider.ratingAverage.toFixed(1)} employer rating` : "No reviews yet"}
              body={provider?.totalRatings ? `${provider.totalRatings} rating${provider.totalRatings === 1 ? "" : "s"} from completed work` : "Reviews appear after completed ShiftPe work"}
            />
          </View>
        </View>
      </ScrollView>

      <View style={{ backgroundColor: "rgba(255,255,255,0.94)", borderTopColor: colors.border, borderTopWidth: 1, bottom: 0, flexDirection: "row", gap: spacing.md, left: 0, padding: spacing.lg, position: "absolute", right: 0 }}>
        <TouchableOpacity activeOpacity={0.86} style={{ alignItems: "center", borderColor: colors.border, borderRadius: 999, borderWidth: 1, height: 56, justifyContent: "center", width: 56 }}>
          <Ionicons name="bookmark-outline" color={colors.text} size={22} />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.86}
          disabled={applying || Boolean(user?.isWorking)}
          onPress={apply}
          style={{ alignItems: "center", backgroundColor: user?.isWorking ? colors.border : colors.accent, borderRadius: 999, flex: 1, flexDirection: "row", gap: spacing.sm, justifyContent: "center" }}
        >
          {applying ? <ActivityIndicator color={colors.white} /> : <Ionicons name="flash" color={colors.white} size={19} />}
          <Text style={{ color: colors.white, fontSize: typography.body, fontWeight: "900" }}>
            {user?.isWorking ? "Active Shift Running" : "Request to Join"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "green" }) {
  return (
    <View style={{ flex: 1, gap: 4 }}>
      <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700" }}>{label}</Text>
      <Text style={{ color: tone === "green" ? colors.success : colors.text, fontSize: 17, fontWeight: "900" }}>{value}</Text>
    </View>
  );
}

function InfoCard({ icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <View style={{ alignItems: "center", backgroundColor: colors.surfaceAlt, borderRadius: radius.md, flexDirection: "row", gap: spacing.md, padding: spacing.md }}>
      <View style={{ alignItems: "center", backgroundColor: colors.white, borderRadius: 16, height: 44, justifyContent: "center", width: 44 }}>
        <Ionicons name={icon} color={colors.accent} size={20} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontSize: typography.small, fontWeight: "900" }}>{title}</Text>
        <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 19 }}>{body}</Text>
      </View>
    </View>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value || 0);
}

const circleButtonStyle = {
  alignItems: "center" as const,
  backgroundColor: "rgba(255,255,255,0.92)",
  borderRadius: 999,
  height: 46,
  justifyContent: "center" as const,
  width: 46,
};
