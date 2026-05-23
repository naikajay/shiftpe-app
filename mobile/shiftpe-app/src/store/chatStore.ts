import { create } from "zustand";

import { chatService } from "../services/chatService";
import { useAuthStore } from "./authStore";
import { useSocketStore } from "./socketStore";
import { ChatRoom, Message } from "../types/task";

type MessageAck = {
  success: boolean;
  data?: Message;
  message?: string;
};

interface ChatStoreState {
  roomsByRequestId: Record<string, ChatRoom>;
  messagesByRoomId: Record<string, Message[]>;
  typingByRoomId: Record<string, boolean>;
  onlineByRoomId: Record<string, boolean>;
  seenAtByRoomId: Record<string, string | null>;
  joinedRoomIds: Record<string, boolean>;
  loading: boolean;
  sending: boolean;
  error: string | null;
  loadRequestChat: (requestId: string) => Promise<ChatRoom>;
  loadMessages: (chatRoomId: string) => Promise<void>;
  joinRoom: (chatRoomId: string) => Promise<void>;
  sendMessage: (chatRoomId: string, message: string) => Promise<void>;
  sendTyping: (chatRoomId: string, isTyping: boolean) => void;
  markSeen: (chatRoomId: string, messageIds?: string[]) => void;
  addMessage: (message: Message) => void;
  setTyping: (chatRoomId: string, typing: boolean) => void;
  setOnline: (chatRoomId: string, online: boolean) => void;
  clearError: () => void;
}

const typingTimers = new Map<string, ReturnType<typeof setTimeout>>();

const makeOptimisticMessage = (chatRoomId: string, message: string, senderId: string): Message => ({
  _id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  chatRoomId,
  senderId,
  messageType: "text",
  message,
  createdAt: new Date().toISOString(),
});

const mergeMessage = (messages: Message[], message: Message) => {
  if (messages.some((item) => item._id === message._id)) {
    return messages;
  }

  return [message, ...messages];
};

export const useChatStore = create<ChatStoreState>((set, get) => ({
  roomsByRequestId: {},
  messagesByRoomId: {},
  typingByRoomId: {},
  onlineByRoomId: {},
  seenAtByRoomId: {},
  joinedRoomIds: {},
  loading: false,
  sending: false,
  error: null,

  async loadRequestChat(requestId) {
    set({ loading: true, error: null });
    try {
      const room = await chatService.getRequestChatRoom(requestId);
      set((state) => ({
        roomsByRequestId: { ...state.roomsByRequestId, [requestId]: room },
      }));
      return room;
    } catch (caught: any) {
      set({ error: caught.message });
      throw caught;
    } finally {
      set({ loading: false });
    }
  },

  async loadMessages(chatRoomId) {
    set({ loading: true, error: null });
    try {
      const messages = await chatService.getMessages(chatRoomId);
      set((state) => ({
        messagesByRoomId: { ...state.messagesByRoomId, [chatRoomId]: messages },
      }));
    } catch (caught: any) {
      set({ error: caught.message });
    } finally {
      set({ loading: false });
    }
  },

  async joinRoom(chatRoomId) {
    const socket = await useSocketStore.getState().connect();
    const currentUserId = useAuthStore.getState().user?._id;

    if (get().joinedRoomIds[chatRoomId]) {
      socket.emit("chat:join", { chatRoomId });
      get().markSeen(chatRoomId);
      return;
    }

    socket.on("message:new", (message: Message) => {
      if (message.chatRoomId !== chatRoomId) return;
      get().addMessage(message);
      if (typeof message.senderId === "string" ? message.senderId !== currentUserId : message.senderId._id !== currentUserId) {
        get().markSeen(chatRoomId, [message._id]);
      }
    });

    socket.on("chat:typing", (payload: { chatRoomId: string; userId: string; isTyping: boolean }) => {
      if (payload.chatRoomId !== chatRoomId || payload.userId === currentUserId) return;

      get().setTyping(chatRoomId, payload.isTyping);
      const existingTimer = typingTimers.get(chatRoomId);
      if (existingTimer) clearTimeout(existingTimer);
      typingTimers.set(chatRoomId, setTimeout(() => get().setTyping(chatRoomId, false), 1800));
    });

    socket.on("message:seen", (payload: { chatRoomId: string; seenAt?: string }) => {
      if (payload.chatRoomId !== chatRoomId) return;
      set((state) => ({
        seenAtByRoomId: {
          ...state.seenAtByRoomId,
          [chatRoomId]: payload.seenAt || new Date().toISOString(),
        },
      }));
    });

    socket.on("user:online", (payload: { chatRoomId?: string; online: boolean }) => {
      if (payload.chatRoomId && payload.chatRoomId !== chatRoomId) return;
      get().setOnline(chatRoomId, payload.online);
    });

    socket.emit("chat:join", { chatRoomId });
    get().markSeen(chatRoomId);
    set((state) => ({
      joinedRoomIds: { ...state.joinedRoomIds, [chatRoomId]: true },
    }));
  },

  async sendMessage(chatRoomId, message) {
    const text = message.trim();
    const currentUserId = useAuthStore.getState().user?._id;
    if (!text || !currentUserId) return;

    const socket = await useSocketStore.getState().connect();
    const optimisticMessage = makeOptimisticMessage(chatRoomId, text, currentUserId);

    set((state) => ({
      sending: true,
      error: null,
      messagesByRoomId: {
        ...state.messagesByRoomId,
        [chatRoomId]: mergeMessage(state.messagesByRoomId[chatRoomId] ?? [], optimisticMessage),
      },
    }));

    socket.emit("message:send", { chatRoomId, message: text }, (ack: MessageAck) => {
      if (!ack.success || !ack.data) {
        set((state) => ({
          sending: false,
          error: ack.message || "Failed to send message.",
          messagesByRoomId: {
            ...state.messagesByRoomId,
            [chatRoomId]: (state.messagesByRoomId[chatRoomId] ?? []).filter((item) => item._id !== optimisticMessage._id),
          },
        }));
        return;
      }

      const confirmedMessage = ack.data;
      set((state) => ({
        sending: false,
        messagesByRoomId: {
          ...state.messagesByRoomId,
          [chatRoomId]: [
            confirmedMessage,
            ...(state.messagesByRoomId[chatRoomId] ?? []).filter(
              (item) => item._id !== optimisticMessage._id && item._id !== confirmedMessage._id
            ),
          ],
        },
      }));
    });
  },

  sendTyping(chatRoomId, isTyping) {
    useSocketStore.getState().socket?.emit("chat:typing", { chatRoomId, isTyping });
  },

  markSeen(chatRoomId, messageIds = []) {
    useSocketStore.getState().socket?.emit("message:seen", { chatRoomId, messageIds });
  },

  addMessage(message) {
    set((state) => ({
      messagesByRoomId: {
        ...state.messagesByRoomId,
        [message.chatRoomId]: mergeMessage(state.messagesByRoomId[message.chatRoomId] ?? [], message),
      },
    }));
  },

  setTyping(chatRoomId, typing) {
    set((state) => ({ typingByRoomId: { ...state.typingByRoomId, [chatRoomId]: typing } }));
  },

  setOnline(chatRoomId, online) {
    set((state) => ({ onlineByRoomId: { ...state.onlineByRoomId, [chatRoomId]: online } }));
  },

  clearError() {
    set({ error: null });
  },
}));
