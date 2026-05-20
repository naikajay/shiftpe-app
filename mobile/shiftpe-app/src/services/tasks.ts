import { API, getErrorMessage, unwrapApiResponse } from "./api";
import { ApiResponse, AuthUser } from "../types/auth";
import {
  ExploreTasksQuery,
  ChatRoom,
  Message,
  Payment,
  Task,
  TaskRequest,
  TaskStatus,
} from "../types/task";

export interface CreateTaskPayload {
  title: string;
  description: string;
  category: string;
  payAmount: number;
  payType: Task["payType"];
  workersNeeded: number;
  startTime: string;
  endTime: string;
  location: Task["location"];
  address: string;
}

export interface UpdateProfilePayload {
  fullName?: string;
  profileImage?: string;
  skills?: string[];
  location?: AuthUser["location"];
  isAvailable?: boolean;
}

export interface SendMessagePayload {
  chatRoomId: string;
  message: string;
  messageType?: "text" | "image" | "location";
}

export interface SwipeFeedTask {
  taskId: string;
  title: string;
  description: string;
  payAmount: number;
  payType: Task["payType"];
  workersNeeded: number;
  workersJoined: number;
  startTime: string;
  endTime: string;
  address: string;
  distance?: number;
  taskProvider?: {
    _id: string;
    fullName: string;
    phone?: string;
    ratingAverage?: number;
    verified?: boolean;
  } | null;
}

export const tasks = {
  async getSwipeFeed(query: ExploreTasksQuery & { page?: number } = {}): Promise<{
    page: number;
    limit: number;
    hasMore: boolean;
    tasks: SwipeFeedTask[];
  }> {
    try {
      const response = await API.get<
        ApiResponse<{
          page: number;
          limit: number;
          hasMore: boolean;
          tasks: SwipeFeedTask[];
        }>
      >("/tasks/swipe-feed", { params: { limit: 20, ...query } });
      return unwrapApiResponse(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to load swipe feed."));
    }
  },

  async swipeRight(taskId: string) {
    try {
      const response = await API.post(`/tasks/${taskId}/swipe-right`);
      return unwrapApiResponse(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to request this task."));
    }
  },

  async swipeLeft(taskId: string) {
    try {
      const response = await API.post(`/tasks/${taskId}/swipe-left`);
      return unwrapApiResponse(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to skip this task."));
    }
  },

  async getNearbyTasks(query: ExploreTasksQuery = {}): Promise<Task[]> {
    try {
      const response = await API.get<
        ApiResponse<{ count: number; tasks: Task[] }> | { count: number; tasks: Task[] }
      >("/tasks/explore", { params: query });
      return unwrapApiResponse(response.data).tasks ?? [];
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to load nearby tasks."));
    }
  },

  async createTask(payload: CreateTaskPayload): Promise<Task> {
    try {
      const response = await API.post<ApiResponse<{ task: Task }> | { task: Task }>(
        "/tasks",
        payload
      );
      return unwrapApiResponse(response.data).task;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to create task."));
    }
  },

  async getProviderTasks(status?: TaskStatus): Promise<Task[]> {
    try {
      const response = await API.get<
        ApiResponse<{ count: number; tasks: Task[] }> | { count: number; tasks: Task[] }
      >("/tasks/provider", { params: status ? { status } : undefined });
      return unwrapApiResponse(response.data).tasks ?? [];
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to load your tasks."));
    }
  },

  async updateTaskStatus(taskId: string, status: Extract<TaskStatus, "open" | "completed" | "cancelled">): Promise<Task> {
    try {
      const response = await API.patch<ApiResponse<{ task: Task }> | { task: Task }>(
        `/tasks/${taskId}/status`,
        { status }
      );
      return unwrapApiResponse(response.data).task;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to update task status."));
    }
  },

  async applyForTask(taskId: string): Promise<TaskRequest> {
    try {
      const response = await API.post<
        ApiResponse<{ request: TaskRequest }> | { request: TaskRequest }
      >("/task-requests", { taskId });
      return unwrapApiResponse(response.data).request;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to apply for this task."));
    }
  },

  async acceptTaskRequest(requestId: string): Promise<{ request: TaskRequest; task: Task }> {
    try {
      const response = await API.patch<
        ApiResponse<{ request: TaskRequest; task: Task }> | { request: TaskRequest; task: Task }
      >(`/task-requests/${requestId}/accept`);
      return unwrapApiResponse(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to accept task request."));
    }
  },

  async rejectTaskRequest(requestId: string): Promise<TaskRequest> {
    try {
      const response = await API.patch<
        ApiResponse<{ request: TaskRequest }> | { request: TaskRequest }
      >(`/task-requests/${requestId}/reject`);
      return unwrapApiResponse(response.data).request;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to reject task request."));
    }
  },

  async getTaskApplicants(taskId: string): Promise<TaskRequest[]> {
    try {
      const response = await API.get<
        ApiResponse<{ count: number; requests: TaskRequest[] }> | { count: number; requests: TaskRequest[] }
      >(`/task-requests/tasks/${taskId}/applicants`);
      return unwrapApiResponse(response.data).requests ?? [];
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to load applicants."));
    }
  },

  async getWorkerRequests(status?: TaskRequest["status"]): Promise<TaskRequest[]> {
    try {
      const response = await API.get<
        ApiResponse<{ count: number; requests: TaskRequest[] }> | { count: number; requests: TaskRequest[] }
      >("/task-requests/my", { params: status ? { status } : undefined });
      return unwrapApiResponse(response.data).requests ?? [];
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to load your task requests."));
    }
  },

  async markRequestComplete(requestId: string): Promise<{ request: TaskRequest; task: Task }> {
    try {
      const response = await API.patch<
        ApiResponse<{ request: TaskRequest; task: Task }> | { request: TaskRequest; task: Task }
      >(`/task-requests/${requestId}/complete`);
      return unwrapApiResponse(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to mark work complete."));
    }
  },

  async getRequestChatRoom(requestId: string): Promise<ChatRoom> {
    try {
      const response = await API.get<ApiResponse<{ chatRoom: ChatRoom }> | { chatRoom: ChatRoom }>(
        `/task-requests/${requestId}/chat`
      );
      return unwrapApiResponse(response.data).chatRoom;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to open chat."));
    }
  },

  async getActiveTask(): Promise<Task | null> {
    try {
      const response = await API.get<ApiResponse<{ task: Task | null }> | { task: Task | null }>(
        "/workers/active-task"
      );
      return unwrapApiResponse(response.data).task;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to load active task."));
    }
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
    try {
      const response = await API.patch<ApiResponse<{ user: AuthUser }> | { user: AuthUser }>(
        "/auth/me",
        payload
      );
      return unwrapApiResponse(response.data).user;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to update profile."));
    }
  },

  async getNearbyWorkers(query: ExploreTasksQuery = {}): Promise<AuthUser[]> {
    try {
      const response = await API.get<
        ApiResponse<{ count: number; workers: AuthUser[] }> | { count: number; workers: AuthUser[] }
      >("/workers/nearby", { params: query });
      return unwrapApiResponse(response.data).workers ?? [];
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to load nearby workers."));
    }
  },

  async sendMessage(payload: SendMessagePayload): Promise<Message> {
    try {
      const response = await API.post<ApiResponse<{ message: Message }> | { message: Message }>(
        "/messages",
        payload
      );
      return unwrapApiResponse(response.data).message;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to send message."));
    }
  },

  async getMessages(chatRoomId: string, limit = 50): Promise<Message[]> {
    try {
      const response = await API.get<
        ApiResponse<{ count: number; messages: Message[] }> | { count: number; messages: Message[] }
      >(`/messages/${chatRoomId}`, { params: { limit } });
      return unwrapApiResponse(response.data).messages ?? [];
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to load messages."));
    }
  },

  async getPayments(): Promise<Payment[]> {
    try {
      const response = await API.get<
        ApiResponse<{ count: number; payments: Payment[] }> | { count: number; payments: Payment[] }
      >("/payments");
      return unwrapApiResponse(response.data).payments ?? [];
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to load payments."));
    }
  },

  async markPaymentPaid(paymentId: string, transactionRef = ""): Promise<Payment> {
    try {
      const response = await API.patch<ApiResponse<{ payment: Payment }> | { payment: Payment }>(
        `/payments/${paymentId}/paid`,
        { transactionRef }
      );
      return unwrapApiResponse(response.data).payment;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to mark payment paid."));
    }
  },

  async verifyRazorpayPayment(
    paymentId: string,
    payload: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }
  ): Promise<Payment> {
    try {
      const response = await API.post<ApiResponse<{ payment: Payment }> | { payment: Payment }>(
        `/payments/${paymentId}/razorpay/verify`,
        payload
      );
      return unwrapApiResponse(response.data).payment;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to verify Razorpay payment."));
    }
  },

  async submitVerification(payload: {
    documentType: "aadhaar" | "pan" | "selfie" | "driving_license" | "voter_id" | "other";
    documentUrl: string;
    notes?: string;
  }) {
    try {
      const response = await API.post("/verifications", payload);
      return unwrapApiResponse(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to submit verification."));
    }
  },

  async getMyVerifications() {
    try {
      const response = await API.get("/verifications/my");
      return unwrapApiResponse(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to load verifications."));
    }
  },

  async rateWorker(payload: { taskId: string; toUserId: string; score: number; review?: string }) {
    try {
      const response = await API.post("/ratings", payload);
      return unwrapApiResponse(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to submit rating."));
    }
  },
};

export const taskService = tasks;
