import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";

import { useAuth } from "./AuthContext";
import { useNotificationStore } from "../store/notificationStore";
import { useSocketStore } from "../store/socketStore";
import { useTaskStore } from "../store/taskStore";
import { ExploreTasksQuery, Task, TaskRequest } from "../types/task";

interface TaskContextType {
  tasks: Task[];
  recommendedTasks: Task[];
  activeTask: Task | null;
  activeRequest: TaskRequest | null;
  loadingTasks: boolean;
  refreshing: boolean;
  applyingTaskId: string | null;
  error: string | null;
  loadDashboard: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  applyForTask: (taskId: string) => Promise<void>;
  swipeTask: (taskId: string, action: "interested" | "ignored") => Promise<void>;
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
  const pushNotification = useNotificationStore((state) => state.pushNotification);
  const {
    tasks,
    recommendedTasks,
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
    swipeTask: swipeTaskStore,
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

  const swipeTask = useCallback(
    async (taskId: string, action: "interested" | "ignored") => {
      await swipeTaskStore(taskId, action, nearbyQuery);
    },
    [nearbyQuery, swipeTaskStore]
  );

  const markActiveWorkComplete = useCallback(async () => {
    await markActiveWorkCompleteStore(nearbyQuery);
  }, [markActiveWorkCompleteStore, nearbyQuery]);

  useEffect(() => {
    if (!user) return;

    let mounted = true;
    connectSocket().then((socket) => {
      if (!mounted) return;
      const handleTaskUpsert = (task: Task) => {
        upsertTask(task);
      };

      socket.on("task:accepted", refreshDashboard);
      socket.on("taskAccepted", refreshDashboard);
      socket.on("task:work-completed", refreshDashboard);
      socket.on("task:status", refreshDashboard);
      socket.on("paymentReceived", refreshDashboard);
      socket.on("task:new-nearby", handleTaskUpsert);
      socket.on("newTask", handleTaskUpsert);
      socket.on("task:update", handleTaskUpsert);
      socket.on("notification:new", pushNotification);
    });

    return () => {
      mounted = false;
      const socket = useSocketStore.getState().socket;
      socket?.off("task:accepted", refreshDashboard);
      socket?.off("taskAccepted", refreshDashboard);
      socket?.off("task:work-completed", refreshDashboard);
      socket?.off("task:status", refreshDashboard);
      socket?.off("paymentReceived", refreshDashboard);
      socket?.off("task:new-nearby");
      socket?.off("newTask");
      socket?.off("task:update");
      socket?.off("notification:new");
    };
  }, [connectSocket, pushNotification, refreshDashboard, upsertTask, user]);

  const value = useMemo(
    () => ({
      tasks,
      recommendedTasks,
      activeTask,
      activeRequest,
      loadingTasks,
      refreshing,
      applyingTaskId,
      error,
      loadDashboard,
      refreshDashboard,
      applyForTask,
      swipeTask,
      markActiveWorkComplete,
      clearError,
    }),
    [
      tasks,
      recommendedTasks,
      activeTask,
      activeRequest,
      loadingTasks,
      refreshing,
      applyingTaskId,
      error,
      loadDashboard,
      refreshDashboard,
      applyForTask,
      swipeTask,
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
