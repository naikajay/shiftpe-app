import { create, AxiosError } from "axios";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

import { storageKeys } from "../constants/storage";
import { ApiResponse } from "../types/auth";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const getExpoHost = () => {
  const debuggerHost =
    Constants.manifest?.debuggerHost || Constants.expoConfig?.hostUri;

  return debuggerHost?.split(":")[0];
};

const isLoopbackHost = (host: string) =>
  ["localhost", "127.0.0.1", "::1"].includes(host);

const resolveNativeLocalhost = (url: string) => {
  if (Platform.OS === "web") {
    return url;
  }

  try {
    const parsedUrl = new URL(url);
    const expoHost = getExpoHost();

    if (expoHost && isLoopbackHost(parsedUrl.hostname)) {
      parsedUrl.hostname = expoHost;
      return trimTrailingSlash(parsedUrl.toString());
    }
  } catch {
    return url;
  }

  return url;
};

const getApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return resolveNativeLocalhost(trimTrailingSlash(process.env.EXPO_PUBLIC_API_BASE_URL));
  }

  const host = process.env.EXPO_PUBLIC_API_HOST;
  const port = process.env.EXPO_PUBLIC_API_PORT;

  if (host && port) {
    const expoHost = Platform.OS !== "web" && isLoopbackHost(host) ? getExpoHost() : null;
    return `http://${expoHost || host}:${port}/api`;
  }

  const expoHost = getExpoHost();

  if (expoHost && port) {
    return `http://${expoHost}:${port}/api`;
  }

  throw new Error(
    "Missing API config. Set EXPO_PUBLIC_API_BASE_URL or EXPO_PUBLIC_API_HOST and EXPO_PUBLIC_API_PORT."
  );
};

export const API = create({
  baseURL: getApiBaseUrl(),
  timeout: Number(process.env.EXPO_PUBLIC_API_TIMEOUT_MS) || 15000,
});

export const getErrorMessage = (error: unknown, fallback: string) => {
  const axiosError = error as AxiosError<{ message?: string; error?: unknown }>;
  return axiosError.response?.data?.message || axiosError.message || fallback;
};

export const unwrapApiResponse = <T>(payload: T | ApiResponse<T>): T => {
  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    "data" in payload
  ) {
    return (payload as ApiResponse<T>).data;
  }

  return payload as T;
};

export const clearStoredAuth = async () => {
  await AsyncStorage.multiRemove([
    storageKeys.authToken,
    storageKeys.authUser,
    storageKeys.pendingAuth,
  ]);
};

API.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(storageKeys.authToken);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await clearStoredAuth();
    }

    return Promise.reject(error);
  }
);

export default API;
