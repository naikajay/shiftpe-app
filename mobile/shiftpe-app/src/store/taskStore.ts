import { create } from "zustand";

import { tasks as taskService } from "../services/tasks";
import { ExploreTasksQuery, Message, Task, TaskRequest } from "../types/task";
import { storage } from "../utils/storage";

const taskCacheKeys = {
  nearbyTasks: "shiftpe.cache.nearbyTasks",
  activeTask: "shiftpe.cache.activeTask",
  activeRequest: "shiftpe.cache.activeRequest",
  messages: (chatRoomId: string) => `shiftpe.cache.messages.${chatRoomId}`,
};

interface TaskStoreState {
  tasks: Task[];
  activeTask: Task | null;
  activeRequest: TaskRequest | null;
  loadingTasks: boolean;
  refreshing: boolean;
  applyingTaskId: string | null;
  error: string | null;
  hydrateCache: () => Promise<void>;
  loadDashboard: (query: ExploreTasksQuery) => Promise<void>;
  refreshDashboard: (query: ExploreTasksQuery) => Promise<void>;
  applyForTask: (taskId: string, query: ExploreTasksQuery) => Promise<void>;
  markActiveWorkComplete: (query: ExploreTasksQuery) => Promise<void>;
  upsertTask: (task: Task) => Promise<void>;
  cacheMessages: (chatRoomId: string, messages: Message[]) => Promise<void>;
  getCachedMessages: (chatRoomId: string) => Promise<Message[]>;
  clearError: () => void;
}

const saveDashboardCache = async (
  nextTasks: Task[],
  nextActiveTask: Task | null,
  nextActiveRequest: TaskRequest | null
) => {
  await Promise.all([
    storage.setJson(taskCacheKeys.nearbyTasks, nextTasks),
    storage.setJson(taskCacheKeys.activeTask, nextActiveTask),
    storage.setJson(taskCacheKeys.activeRequest, nextActiveRequest),
  ]);
};

const fetchDashboard = async (query: ExploreTasksQuery) => {
  const [nextTasks, nextActiveTask, requests] = await Promise.all([
    taskService.getNearbyTasks(query),
    taskService.getActiveTask(),
    taskService.getWorkerRequests("accepted"),
  ]);

  return {
    nextTasks,
    nextActiveTask,
    nextActiveRequest: requests[0] ?? null,
  };
};

export const useTaskStore = create<TaskStoreState>((set, get) => ({
  tasks: [],
  activeTask: null,
  activeRequest: null,
  loadingTasks: false,
  refreshing: false,
  applyingTaskId: null,
  error: null,

  async hydrateCache() {
    const [cachedTasks, cachedActiveTask, cachedActiveRequest] = await Promise.all([
      storage.getJson<Task[]>(taskCacheKeys.nearbyTasks),
      storage.getJson<Task | null>(taskCacheKeys.activeTask),
      storage.getJson<TaskRequest | null>(taskCacheKeys.activeRequest),
    ]);

    set({
      tasks: cachedTasks ?? [],
      activeTask: cachedActiveTask ?? null,
      activeRequest: cachedActiveRequest ?? null,
    });
  },

  async loadDashboard(query) {
    set({ loadingTasks: true, error: null });
    try {
      await get().hydrateCache();
      const { nextTasks, nextActiveTask, nextActiveRequest } = await fetchDashboard(query);
      await saveDashboardCache(nextTasks, nextActiveTask, nextActiveRequest);
      set({ tasks: nextTasks, activeTask: nextActiveTask, activeRequest: nextActiveRequest });
    } catch (caught: any) {
      set({ error: caught.message });
    } finally {
      set({ loadingTasks: false });
    }
  },

  async refreshDashboard(query) {
    set({ refreshing: true, error: null });
    try {
      const { nextTasks, nextActiveTask, nextActiveRequest } = await fetchDashboard(query);
      await saveDashboardCache(nextTasks, nextActiveTask, nextActiveRequest);
      set({ tasks: nextTasks, activeTask: nextActiveTask, activeRequest: nextActiveRequest });
    } catch (caught: any) {
      set({ error: caught.message });
    } finally {
      set({ refreshing: false });
    }
  },

  async applyForTask(taskId, query) {
    set({ applyingTaskId: taskId, error: null });
    try {
      await taskService.applyForTask(taskId);
      await get().refreshDashboard(query);
    } catch (caught: any) {
      set({ error: caught.message });
      throw caught;
    } finally {
      set({ applyingTaskId: null });
    }
  },

  async markActiveWorkComplete(query) {
    const activeRequest = get().activeRequest;
    if (!activeRequest?._id) {
      set({ error: "No active task request found." });
      return;
    }

    set({ loadingTasks: true, error: null });
    try {
      await taskService.markRequestComplete(activeRequest._id);
      await get().refreshDashboard(query);
    } catch (caught: any) {
      set({ error: caught.message });
      throw caught;
    } finally {
      set({ loadingTasks: false });
    }
  },

  async upsertTask(task) {
    const nextTasks = get().tasks.map((item) => (item._id === task._id ? task : item));
    await storage.setJson(taskCacheKeys.nearbyTasks, nextTasks);
    set({ tasks: nextTasks });
  },

  async cacheMessages(chatRoomId, messages) {
    await storage.setJson(taskCacheKeys.messages(chatRoomId), messages);
  },

  async getCachedMessages(chatRoomId) {
    return (await storage.getJson<Message[]>(taskCacheKeys.messages(chatRoomId))) ?? [];
  },

  clearError() {
    set({ error: null });
  },
}));
