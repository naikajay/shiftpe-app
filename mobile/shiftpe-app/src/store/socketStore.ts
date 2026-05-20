import { create } from "zustand";
import { Socket } from "socket.io-client";

import { realtime } from "../services/realtime";

interface SocketStoreState {
  socket: Socket | null;
  connected: boolean;
  onlineUsers: Record<string, boolean>;
  connect: () => Promise<Socket>;
  disconnect: () => void;
  setOnline: (userId: string, online: boolean) => void;
}

export const useSocketStore = create<SocketStoreState>((set) => ({
  socket: null,
  connected: false,
  onlineUsers: {},

  async connect() {
    const socket = await realtime.connect();
    set({ socket, connected: socket.connected });

    socket.off("connect");
    socket.off("disconnect");
    socket.off("user:online");

    socket.on("connect", () => set({ connected: true }));
    socket.on("disconnect", () => set({ connected: false }));
    socket.on("user:online", ({ userId, online }: { userId: string; online: boolean }) => {
      set((state) => ({
        onlineUsers: {
          ...state.onlineUsers,
          [userId]: online,
        },
      }));
    });

    return socket;
  },

  disconnect() {
    realtime.disconnect();
    set({ socket: null, connected: false, onlineUsers: {} });
  },

  setOnline(userId, online) {
    set((state) => ({
      onlineUsers: {
        ...state.onlineUsers,
        [userId]: online,
      },
    }));
  },
}));
