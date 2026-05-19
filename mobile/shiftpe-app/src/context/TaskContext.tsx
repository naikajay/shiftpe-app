import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "./AuthContext";
import { realtime } from "../services/realtime";
import { tasks as taskService } from "../services/tasks";
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeRequest, setActiveRequest] = useState<TaskRequest | null>(null);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [applyingTaskId, setApplyingTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoadingTasks(true);
    setError(null);

    try {
      const [nextTasks, nextActiveTask] = await Promise.all([
        taskService.getNearbyTasks(buildNearbyQuery(user?.location)),
        taskService.getActiveTask(),
      ]);
      const requests = await taskService.getWorkerRequests("accepted");

      setTasks(nextTasks);
      setActiveTask(nextActiveTask);
      setActiveRequest(requests[0] ?? null);
    } catch (caught: any) {
      setError(caught.message);
    } finally {
      setLoadingTasks(false);
    }
  }, [user?.location]);

  const refreshDashboard = useCallback(async () => {
    setRefreshing(true);
    setError(null);

    try {
      const [nextTasks, nextActiveTask] = await Promise.all([
        taskService.getNearbyTasks(buildNearbyQuery(user?.location)),
        taskService.getActiveTask(),
      ]);
      const requests = await taskService.getWorkerRequests("accepted");

      setTasks(nextTasks);
      setActiveTask(nextActiveTask);
      setActiveRequest(requests[0] ?? null);
    } catch (caught: any) {
      setError(caught.message);
    } finally {
      setRefreshing(false);
    }
  }, [user?.location]);

  const applyForTask = useCallback(
    async (taskId: string) => {
      setApplyingTaskId(taskId);
      setError(null);

      try {
        await taskService.applyForTask(taskId);
        await refreshDashboard();
      } catch (caught: any) {
        setError(caught.message);
        throw caught;
      } finally {
        setApplyingTaskId(null);
      }
    },
    [refreshDashboard]
  );

  useEffect(() => {
    if (!user) return;

    let mounted = true;
    realtime.connect().then((socket) => {
      if (!mounted) return;
      socket.on("task:accepted", refreshDashboard);
      socket.on("task:work-completed", refreshDashboard);
      socket.on("task:status", refreshDashboard);
    });

    return () => {
      mounted = false;
      const socket = realtime.getSocket();
      socket?.off("task:accepted", refreshDashboard);
      socket?.off("task:work-completed", refreshDashboard);
      socket?.off("task:status", refreshDashboard);
    };
  }, [refreshDashboard, user]);

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
      markActiveWorkComplete: async () => {
        if (!activeRequest?._id) {
          setError("No active task request found.");
          return;
        }
        setLoadingTasks(true);
        setError(null);
        try {
          await taskService.markRequestComplete(activeRequest._id);
          await refreshDashboard();
        } catch (caught: any) {
          setError(caught.message);
          throw caught;
        } finally {
          setLoadingTasks(false);
        }
      },
      clearError: () => setError(null),
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
