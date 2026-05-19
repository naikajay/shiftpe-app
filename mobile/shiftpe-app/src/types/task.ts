import { AuthUser } from "./auth";

export type PayType = "hourly" | "daily" | "fixed";
export type TaskStatus = "draft" | "open" | "full" | "in_progress" | "completed" | "cancelled";
export type RequestStatus = "pending" | "accepted" | "rejected" | "cancelled" | "completed";

export interface GeoPoint {
  type: "Point";
  coordinates: [number, number];
}

export interface Task {
  _id: string;
  taskProviderId: string | AuthUser;
  title: string;
  description: string;
  category: string;
  payAmount: number;
  payType: PayType;
  workersNeeded: number;
  workersJoined: number;
  startTime: string;
  endTime: string;
  location: GeoPoint;
  address: string;
  status: TaskStatus;
  distanceMeters?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskRequest {
  _id: string;
  taskId: string | Task;
  workerId: string | AuthUser;
  taskProviderId: string | AuthUser;
  status: RequestStatus;
  requestedAt: string;
  respondedAt?: string | null;
  responseNote?: string;
}

export interface ChatRoom {
  _id: string;
  taskId: string | Task;
  participants: string[] | AuthUser[];
  lastMessage?: string;
  lastMessageAt?: string;
  isActive: boolean;
}

export interface Message {
  _id: string;
  chatRoomId: string;
  senderId: string | AuthUser;
  messageType: "text" | "image" | "location";
  message: string;
  createdAt: string;
}

export interface Payment {
  _id: string;
  taskId: string | Task;
  payerId: string | AuthUser;
  receiverId: string | AuthUser;
  amount: number;
  platformFeeAmount?: number;
  workerNetAmount?: number;
  paymentMethod: "UPI" | "Cash" | "Card" | "Wallet";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  transactionRef?: string;
  paidAt?: string | null;
}

export interface ExploreTasksQuery {
  longitude?: number;
  latitude?: number;
  radiusKm?: number;
  category?: string;
  payType?: PayType;
  minPay?: number;
  maxPay?: number;
  limit?: number;
  sortBy?: "startTime" | "payAmount" | "createdAt" | "distance";
}
