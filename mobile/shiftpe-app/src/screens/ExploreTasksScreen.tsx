import { useEffect, useRef, useState } from "react";
import { Alert, Dimensions, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import Swiper from "react-native-deck-swiper";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import SwipeCard from "../components/cards/SwipeCard";
import EmptyState from "../components/ui/EmptyState";
import ScreenContainer from "../components/ui/ScreenContainer";
import ScreenIntro from "../components/design/ScreenIntro";
import TaskCardSkeleton from "../components/TaskCardSkeleton";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "../theme";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Task } from "../types/task";

const { width } = Dimensions.get("window");
const CARD_HEIGHT = 560;

export default function ExploreTasksScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const swiperRef = useRef<Swiper<Task>>(null);
  const { user } = useAuth();
  const {
    activeTask,
    tasks,
    loadingTasks,
    refreshing,
    applyingTaskId,
    error,
    loadDashboard,
    refreshDashboard,
    swipeTask,
  } = useTasks();
  const [swipeError, setSwipeError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const canApply = !activeTask && !user?.isWorking;

  const recordSwipe = async (task: Task | undefined, action: "interested" | "ignored") => {
    if (!task) return;
    setSwipeError(null);

    if (action === "interested" && !canApply) {
      Alert.alert("Active shift", "Complete your current shift before requesting another one.");
      return;
    }

    try {
      await swipeTask(task._id, action);
    } catch (caught: any) {
      setSwipeError(caught.message);
    }
  };

  return (
    <ScreenContainer
      padded={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshDashboard} tintColor={COLORS.primary} />}
    >
      <View style={{ gap: SPACING.sm, paddingHorizontal: SPACING.lg }}>
        <ScreenIntro
          eyebrow="Swipe Discovery"
          title="Swipe into your next shift"
          subtitle="Right means interested. Left skips. Up sends a quick request to join."
        />
      </View>

      <View style={{ flexDirection: "row", gap: SPACING.md, paddingHorizontal: SPACING.lg }}>
        <Hint icon="close" label="Skip" />
        <Hint icon="heart" label="Interested" />
        <Hint icon="arrow-up" label="Quick apply" />
      </View>

      {error || swipeError ? (
        <Text style={{ color: COLORS.danger, fontSize: TYPOGRAPHY.small, paddingHorizontal: SPACING.lg }}>{error || swipeError}</Text>
      ) : null}

      <View style={{ minHeight: CARD_HEIGHT + 28, paddingHorizontal: SPACING.lg }}>
        {loadingTasks && !refreshing ? (
          <View style={{ gap: SPACING.md }}>
            <TaskCardSkeleton />
            <TaskCardSkeleton />
          </View>
        ) : tasks.length ? (
          <Swiper
            key={tasks.map((task) => task._id).join("-")}
            ref={swiperRef}
            cards={tasks}
            cardIndex={0}
            renderCard={(task, index) => (task ? <SwipeCard task={task} index={index} /> : null)}
            onTapCard={(index) => tasks[index] && navigation.navigate("JobDetails", { task: tasks[index] })}
            onSwipedLeft={(index) => recordSwipe(tasks[index], "ignored")}
            onSwipedRight={(index) => recordSwipe(tasks[index], "interested")}
            onSwipedTop={(index) => recordSwipe(tasks[index], "interested")}
            onSwipedAll={refreshDashboard}
            stackSize={3}
            backgroundColor="transparent"
            cardHorizontalMargin={0}
            cardVerticalMargin={8}
            containerStyle={{ height: CARD_HEIGHT, width: width - SPACING.lg * 2 }}
            animateOverlayLabelsOpacity
            animateCardOpacity
            disableBottomSwipe
            overlayLabels={{
              left: overlay("SKIP", COLORS.danger, "14deg"),
              right: overlay("INTERESTED", COLORS.success, "-14deg"),
              top: overlay("APPLY", COLORS.primary, "0deg"),
            }}
          />
        ) : (
          <EmptyState title="No swipe cards" message="New nearby shifts you have not requested will appear here." icon="albums-outline" />
        )}
      </View>

      {tasks.length ? (
        <View style={{ flexDirection: "row", gap: SPACING.md, paddingHorizontal: SPACING.lg }}>
          <SwipeAction icon="close" onPress={() => swiperRef.current?.swipeLeft()} />
          <SwipeAction icon="arrow-up" primary loading={Boolean(applyingTaskId)} onPress={() => swiperRef.current?.swipeTop()} />
          <SwipeAction icon="heart" loading={Boolean(applyingTaskId)} onPress={() => swiperRef.current?.swipeRight()} />
        </View>
      ) : null}
    </ScreenContainer>
  );
}

function Hint({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={{ alignItems: "center", backgroundColor: COLORS.white, borderColor: COLORS.border, borderRadius: RADIUS.pill, borderWidth: 1, flex: 1, flexDirection: "row", gap: SPACING.xs, justifyContent: "center", paddingVertical: SPACING.sm }}>
      <Ionicons name={icon} color={COLORS.primary} size={16} />
      <Text style={{ color: COLORS.text, fontSize: TYPOGRAPHY.micro, fontWeight: "900" }}>{label}</Text>
    </View>
  );
}

function SwipeAction({
  icon,
  primary,
  loading,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  primary?: boolean;
  loading?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      disabled={loading}
      style={{
        alignItems: "center",
        backgroundColor: loading ? COLORS.border : primary ? COLORS.primary : COLORS.white,
        borderRadius: RADIUS.pill,
        flex: primary ? 1.25 : 1,
        height: 58,
        justifyContent: "center",
        ...(primary ? SHADOWS.primary : SHADOWS.card),
      }}
    >
      <Ionicons name={icon} color={primary ? COLORS.white : COLORS.text} size={primary ? 27 : 24} />
    </TouchableOpacity>
  );
}

function overlay(label: string, color: string, rotate: string) {
  return {
    title: label,
    style: {
      label: {
        borderColor: color,
        color,
        borderWidth: 3,
        borderRadius: RADIUS.sm,
        fontSize: label === "INTERESTED" ? 24 : 30,
        fontWeight: "900",
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        transform: [{ rotate }],
      },
      wrapper: {
        alignItems: label === "SKIP" ? "flex-end" : "flex-start",
        justifyContent: "flex-start",
        marginTop: 62,
        marginLeft: 24,
        marginRight: 24,
      },
    },
  };
}
