import { useEffect, useState } from "react";
import { RefreshControl } from "react-native";

import ScreenContainer from "../components/ui/ScreenContainer";
import ScreenIntro from "../components/design/ScreenIntro";
import WorkerCard from "../components/cards/WorkerCard";
import EmptyState from "../components/ui/EmptyState";
import { COLORS } from "../theme";
import { useAuth } from "../context/AuthContext";
import { tasks } from "../services/tasks";
import { AuthUser } from "../types/auth";

export default function HirerDiscoverScreen() {
  const { user } = useAuth();
  const [workers, setWorkers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(false);

  const loadWorkers = async () => {
    setLoading(true);
    try {
      setWorkers(
        await tasks.getNearbyWorkers(
          user?.location?.coordinates
            ? {
                longitude: user.location.coordinates[0],
                latitude: user.location.coordinates[1],
                radiusKm: 25,
                limit: 20,
              }
            : { limit: 20 }
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ScreenContainer refreshControl={<RefreshControl refreshing={loading} onRefresh={loadWorkers} tintColor={COLORS.primary} />}>
      <ScreenIntro eyebrow="Discover workers" title="Available near you" subtitle="Find verified local workers ready for urgent shifts." />
      {workers.length ? (
        workers.map((worker) => <WorkerCard key={worker._id} worker={worker} />)
      ) : (
        <EmptyState title="No nearby workers yet" message="Post a shift from Home and matching workers will appear here." icon="people-outline" />
      )}
    </ScreenContainer>
  );
}
