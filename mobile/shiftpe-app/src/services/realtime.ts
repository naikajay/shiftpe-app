import { io, Socket } from "socket.io-client";

import { API } from "./api";
import { storageKeys } from "../constants/storage";
import { storage } from "../utils/storage";

let socket: Socket | null = null;

const getSocketUrl = () => {
  const baseUrl = API.defaults.baseURL;

  if (!baseUrl) {
    throw new Error("API base URL is not configured.");
  }

  return baseUrl.replace(/\/api\/?$/, "");
};

export const realtime = {
  async connect() {
    const token = await storage.getString(storageKeys.authToken);

    if (!token) {
      throw new Error("Login is required for realtime updates.");
    }

    if (socket?.connected) {
      return socket;
    }

    socket = io(getSocketUrl(), {
      transports: ["websocket"],
      auth: { token },
      extraHeaders: { Authorization: `Bearer ${token}` },
    });

    return socket;
  },

  getSocket() {
    return socket;
  },

  disconnect() {
    socket?.disconnect();
    socket = null;
  },
};
