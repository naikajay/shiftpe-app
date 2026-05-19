export type UserRole = "worker" | "taskProvider" | "admin";

export interface AuthUser {
  _id: string;
  fullName: string;
  phone: string;
  role: UserRole;
  profileImage?: string;
  skills?: string[];
  hourlyRate?: number;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  isWorking?: boolean;
  isAvailable?: boolean;
  activeTaskId?: string | null;
  verified?: boolean;
  reliabilityScore?: number;
  ratingAverage?: number;
}

export interface VerifyOtpPayload {
  idToken: string;
  fullName?: string;
  role?: UserRole;
  profileImage?: string;
  skills?: string[];
  hourlyRate?: number;
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
