export type UserRole = "worker" | "taskProvider" | "admin";

export interface AuthUser {
  _id: string;
  fullName: string;
  phone: string;
  role: UserRole;
  profileImage?: string;
  bio?: string;
  hourlyRate?: number;
  expoPushToken?: string;
  skills?: string[];
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  isWorking?: boolean;
  isAvailable?: boolean;
  isOnline?: boolean;
  activeTaskId?: string | null;
  currentTask?: string | null;
  lastActive?: string | null;
  verified?: boolean;
  reliabilityScore?: number;
  ratingAverage?: number;
  totalRatings?: number;
  completedTasksCount?: number;
}

export interface VerifyOtpPayload {
  idToken: string;
  fullName?: string;
  role?: UserRole;
  profileImage?: string;
  bio?: string;
  hourlyRate?: number;
  skills?: string[];
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: unknown;
}
