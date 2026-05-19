import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Swiper from "react-native-deck-swiper";
import { Ionicons } from "@expo/vector-icons";

import EmptyState from "../components/EmptyState";
import ScreenHeader from "../components/ScreenHeader";
import { colors, radius, spacing, typography } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { tasks as taskService } from "../services/tasks";

const { width } = Dimensions.get("window");
const CARD_WIDTH = Math.min(width - spacing.lg * 2, 380);
const CARD_HEIGHT = 520;

const formatPay = (task) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  }).format(task.payAmount) + (task.payType === "fixed" ? "" : `/${task.payType}`);

const formatDistance = (distance) => {
  if (distance === undefined || distance === null) return "Nearby";
  if (distance < 1000) return `${Math.round(distance)} m away`;
  return `${(distance / 1000).toFixed(1)} km away`;
};

const formatTime = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

function SwipeTaskCard({ task }) {
  const spotsLeft = Math.max(task.workersNeeded - task.workersJoined, 0);

  return (
    <View
      style={{
        width: CARD_WIDTH,
        minHeight: CARD_HEIGHT,
        backgroundColor: colors.white,
        borderColor: colors.border,
        borderRadius: radius.lg,
        borderWidth: 1,
        padding: spacing.lg,
        gap: spacing.lg,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 6,
      }}
    >
      <View style={{ gap: spacing.sm }}>
        <View
          style={{
            alignItems: "center",
            alignSelf: "flex-start",
            backgroundColor: colors.navy,
            borderRadius: 999,
            flexDirection: "row",
            gap: spacing.xs,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
          }}
        >
          <Ionicons name="navigate" size={14} color={colors.white} />
          <Text style={{ color: colors.white, fontSize: typography.small, fontWeight: "800" }}>
            {formatDistance(task.distance)}
          </Text>
        </View>

        <Text style={{ color: colors.text, fontSize: 28, fontWeight: "900" }}>
          {task.title}
        </Text>
        <Text style={{ color: colors.success, fontSize: typography.heading, fontWeight: "900" }}>
          {formatPay(task)}
        </Text>
      </View>

      <Text style={{ color: colors.muted, fontSize: typography.body, lineHeight: 24 }} numberOfLines={4}>
        {task.description}
      </Text>

      <View style={{ gap: spacing.md }}>
        <InfoRow icon="location-outline" text={task.address} />
        <InfoRow icon="time-outline" text={`${formatTime(task.startTime)} - ${formatTime(task.endTime)}`} />
        <InfoRow icon="people-outline" text={`${spotsLeft} of ${task.workersNeeded} spots open`} />
        <InfoRow
          icon="person-circle-outline"
          text={task.taskProvider?.fullName || "Task provider"}
        />
      </View>

      <View
        style={{
          backgroundColor: colors.surfaceAlt,
          borderRadius: radius.md,
          marginTop: "auto",
          padding: spacing.md,
        }}
      >
        <Text style={{ color: colors.navy, fontSize: typography.small, fontWeight: "800" }}>
          Swipe right to send a request. Provider approval is required before joining.
        </Text>
      </View>
    </View>
  );
}

function InfoRow({ icon, text }) {
  return (
    <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.sm }}>
      <Ionicons name={icon} size={18} color={colors.navyMuted} />
      <Text style={{ color: colors.text, flex: 1, fontSize: typography.small, lineHeight: 19 }}>
        {text}
      </Text>
    </View>
  );
}

function OverlayLabel({ label, color, rotate }) {
  return {
    title: label,
    style: {
      label: {
        borderColor: color,
        color,
        borderWidth: 3,
        borderRadius: radius.sm,
        fontSize: 34,
        fontWeight: "900",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        transform: [{ rotate }],
      },
      wrapper: {
        alignItems: label === "LIKE" ? "flex-start" : "flex-end",
        justifyContent: "flex-start",
        marginTop: 42,
        marginLeft: label === "LIKE" ? 24 : 0,
        marginRight: label === "SKIP" ? 24 : 0,
      },
    },
  };
}

export default function SwipeScreen() {
  const { user } = useAuth();
  const swiperRef = useRef(null);
  const [cards, setCards] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const query = useMemo(() => {
    const coordinates = user?.location?.coordinates;
    if (!coordinates) return { page, limit: 20 };
    return {
      longitude: coordinates[0],
      latitude: coordinates[1],
      radiusKm: 25,
      page,
      limit: 20,
    };
  }, [page, user?.location?.coordinates]);

  const loadFeed = useCallback(
    async (nextPage = 1, append = false) => {
      try {
        setError(null);
        if (!append) setLoading(true);
        const response = await taskService.getSwipeFeed({ ...query, page: nextPage });
        setCards((current) => (append ? [...current, ...response.tasks] : response.tasks));
        setHasMore(response.hasMore);
        setPage(response.page);
      } catch (caught) {
        setError(caught.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [query]
  );

  useEffect(() => {
    loadFeed(1);
  }, [loadFeed]);

  const refresh = () => {
    setRefreshing(true);
    loadFeed(1);
  };

  const handleRight = async (cardIndex) => {
    const task = cards[cardIndex];
    if (!task) return;
    try {
      await taskService.swipeRight(task.taskId);
    } catch (caught) {
      setError(caught.message);
    }
  };

  const handleLeft = async (cardIndex) => {
    const task = cards[cardIndex];
    if (!task) return;
    try {
      await taskService.swipeLeft(task.taskId);
    } catch (caught) {
      setError(caught.message);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={{ alignItems: "center", backgroundColor: colors.surface, flex: 1, justifyContent: "center" }}>
        <ActivityIndicator color={colors.navy} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.surface, flex: 1 }}
      contentContainerStyle={{ flexGrow: 1, gap: spacing.lg, padding: spacing.lg, paddingTop: spacing.xl }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.navy} />}
    >
      <ScreenHeader
        eyebrow="Swipe tasks"
        title="Discover nearby work"
        subtitle="Swipe right to request, left to skip. You join only after provider approval."
      />

      {error ? (
        <Text style={{ color: colors.danger, fontSize: typography.small }}>{error}</Text>
      ) : null}

      <View style={{ alignItems: "center", flex: 1, minHeight: CARD_HEIGHT + 70 }}>
        {cards.length ? (
          <Swiper
            ref={swiperRef}
            cards={cards}
            cardIndex={0}
            renderCard={(task) => (task ? <SwipeTaskCard task={task} /> : null)}
            onSwipedRight={handleRight}
            onSwipedLeft={handleLeft}
            onSwipedAll={() => {
              if (hasMore) loadFeed(page + 1, true);
            }}
            stackSize={3}
            backgroundColor="transparent"
            cardHorizontalMargin={0}
            cardVerticalMargin={0}
            animateOverlayLabelsOpacity
            animateCardOpacity
            disableTopSwipe
            disableBottomSwipe
            overlayLabels={{
              left: OverlayLabel({ label: "SKIP", color: colors.danger, rotate: "14deg" }),
              right: OverlayLabel({ label: "LIKE", color: colors.success, rotate: "-14deg" }),
            }}
          />
        ) : (
          <EmptyState
            icon="albums-outline"
            title="No swipe tasks"
            message="Open nearby tasks you have not requested yet will appear here."
          />
        )}
      </View>

      {cards.length ? (
        <View style={{ flexDirection: "row", gap: spacing.md }}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => swiperRef.current?.swipeLeft()}
            style={{
              alignItems: "center",
              backgroundColor: colors.white,
              borderColor: colors.danger,
              borderRadius: 28,
              borderWidth: 1,
              flex: 1,
              height: 56,
              justifyContent: "center",
            }}
          >
            <Ionicons name="close" color={colors.danger} size={26} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => swiperRef.current?.swipeRight()}
            style={{
              alignItems: "center",
              backgroundColor: colors.success,
              borderRadius: 28,
              flex: 1,
              height: 56,
              justifyContent: "center",
            }}
          >
            <Ionicons name="checkmark" color={colors.white} size={28} />
          </TouchableOpacity>
        </View>
      ) : null}
    </ScrollView>
  );
}
