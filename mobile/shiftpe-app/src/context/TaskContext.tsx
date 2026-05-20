import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";

import { useAuth } from "./AuthContext";
import { useSocketStore } from "../store/socketStore";
import { useTaskStore } from "../store/taskStore";
import { ExploreTasksQuery, Task, TaskRequest } from "../types/task";

interface TaskContextType {
  tasks: Task[];
  activeTask: Task | null;
  activeRequest: TaskRequest | null;
  loadingTasks: boolean;
  refreshing: boolean;
  applyingTaskId: string | null;
  error: string | null;
  loadDashboard: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  applyForTask: (taskId: string) => Promise<void>;
  markActiveWorkComplete: () => Promise<void>;
  clearError: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const buildNearbyQuery = (userLocation?: { coordinates: [number, number] }): ExploreTasksQuery => {
  if (!userLocation?.coordinates) {
    return {
      limit: 30,
      sortBy: "createdAt",
    };
  }

  const [longitude, latitude] = userLocation.coordinates;

  return {
    longitude,
    latitude,
    radiusKm: 25,
    limit: 30,
    sortBy: "distance",
  };
};

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const connectSocket = useSocketStore((state) => state.connect);
  const {
    tasks,
    activeTask,
    activeRequest,
    loadingTasks,
    refreshing,
    applyingTaskId,
    error,
    hydrateCache,
    loadDashboard: loadDashboardStore,
    refreshDashboard: refreshDashboardStore,
    applyForTask: applyForTaskStore,
    markActiveWorkComplete: markActiveWorkCompleteStore,
    upsertTask,
    clearError,
  } = useTaskStore();

  const nearbyQuery = useMemo(
    () => buildNearbyQuery(user?.location),
    [user?.location]
  );

  useEffect(() => {
    hydrateCache();
  }, [hydrateCache]);

  const loadDashboard = useCallback(async () => {
    await loadDashboardStore(nearbyQuery);
  }, [loadDashboardStore, nearbyQuery]);

  const refreshDashboard = useCallback(async () => {
    await refreshDashboardStore(nearbyQuery);
  }, [nearbyQuery, refreshDashboardStore]);

  const applyForTask = useCallback(
    async (taskId: string) => {
      await applyForTaskStore(taskId, nearbyQuery);
    },
    [applyForTaskStore, nearbyQuery]
  );

  const markActiveWorkComplete = useCallback(async () => {
    await markActiveWorkCompleteStore(nearbyQuery);
  }, [markActiveWorkCompleteStore, nearbyQuery]);

  useEffect(() => {
    if (!user) return;

    let mounted = true;
    connectSocket().then((socket) => {
      if (!mounted) return;
      socket.on("task:accepted", refreshDashboard);
      socket.on("task:work-completed", refreshDashboard);
      socket.on("task:status", refreshDashboard);
      socket.on("task:update", (task: Task) => {
        upsertTask(task);
      });
    });

    return () => {
      mounted = false;
      const socket = useSocketStore.getState().socket;
      socket?.off("task:accepted", refreshDashboard);
      socket?.off("task:work-completed", refreshDashboard);
      socket?.off("task:status", refreshDashboard);
      socket?.off("task:update");
    };
  }, [connectSocket, refreshDashboard, upsertTask, user]);

  const value = useMemo(
    () => ({
      tasks,
      activeTask,
      activeRequest,
      loadingTasks,
      refreshing,
      applyingTaskId,
      error,
      loadDashboard,
      refreshDashboard,
      applyForTask,
      markActiveWorkComplete,
      clearError,
    }),
    [
      tasks,
      activeTask,
      activeRequest,
      loadingTasks,
      refreshing,
      applyingTaskId,
      error,
      loadDashboard,
      refreshDashboard,
      applyForTask,
      markActiveWorkComplete,
      clearError,
    ]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTasks = () => {
  const context = useContext(TaskContext);

  if (!context) {
    throw new Error("useTasks must be used within TaskProvider");
  }

  return context;
};
