import { RouteProp, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";

import AppButton from "../components/AppButton";
import AppTextInput from "../components/AppTextInput";
import ErrorMessage from "../components/ErrorMessage";
import ScreenHeader from "../components/ScreenHeader";
import { colors, radius, spacing, typography } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../navigation/AppNavigator";
import { realtime } from "../services/realtime";
import { tasks } from "../services/tasks";
import { ChatRoom, Message } from "../types/task";

export default function ChatScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "Chat">>();
  const { user } = useAuth();
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);

  const loadChat = async () => {
    try {
      setLoading(true);
      setError(null);
      const nextRoom = await tasks.getRequestChatRoom(route.params.requestId);
      setRoom(nextRoom);
      setMessages(await tasks.getMessages(nextRoom._id));
    } catch (caught: any) {
      setError(caught.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params.requestId]);

  useEffect(() => {
    if (!room?._id) return;

    let active = true;
    let typingTimer: ReturnType<typeof setTimeout>;

    realtime.connect().then((socket) => {
      if (!active) return;

      socket.emit("chat:join", { chatRoomId: room._id });
      socket.emit("message:seen", { chatRoomId: room._id });

      socket.on("message:new", (message: Message) => {
        if (message.chatRoomId === room._id) {
          setMessages((current) =>
            current.some((item) => item._id === message._id) ? current : [message, ...current]
          );
          socket.emit("message:seen", { chatRoomId: room._id, messageIds: [message._id] });
        }
      });

      socket.on(
        "chat:typing",
        (payload: { chatRoomId: string; userId: string; isTyping: boolean }) => {
          if (payload.chatRoomId === room._id && payload.userId !== user?._id) {
            setTyping(payload.isTyping);
            clearTimeout(typingTimer);
            typingTimer = setTimeout(() => setTyping(false), 1800);
          }
        }
      );
    });

    return () => {
      active = false;
      clearTimeout(typingTimer);
      const socket = realtime.getSocket();
      socket?.off("message:new");
      socket?.off("chat:typing");
    };
  }, [room?._id, user?._id]);

  const updateDraft = (value: string) => {
    setDraft(value);
    if (room?._id) {
      realtime.getSocket()?.emit("chat:typing", {
        chatRoomId: room._id,
        isTyping: value.trim().length > 0,
      });
    }
  };

  const send = async () => {
    if (!room || !draft.trim()) return;

    const sent = await tasks.sendMessage({
      chatRoomId: room._id,
      message: draft.trim(),
    });
    realtime.getSocket()?.emit("chat:typing", { chatRoomId: room._id, isTyping: false });
    setDraft("");
    setMessages((current) => [sent, ...current]);
  };

  return (
    <View style={{ backgroundColor: colors.surface, flex: 1, padding: spacing.lg, paddingTop: spacing.xl }}>
      <ScreenHeader eyebrow="Chat" title="Task conversation" subtitle="Coordinate accepted work here." />
      <ErrorMessage message={error} />
      <FlatList
        data={messages}
        inverted
        keyExtractor={(item) => item._id}
        refreshing={loading}
        onRefresh={loadChat}
        contentContainerStyle={{ gap: spacing.sm, paddingVertical: spacing.lg }}
        renderItem={({ item }) => {
          const mine = typeof item.senderId === "string" ? item.senderId === user?._id : item.senderId._id === user?._id;
          return (
            <View
              style={{
                alignSelf: mine ? "flex-end" : "flex-start",
                backgroundColor: mine ? colors.navy : colors.white,
                borderRadius: radius.md,
                maxWidth: "82%",
                padding: spacing.md,
              }}
            >
              <Text style={{ color: mine ? colors.white : colors.text, fontSize: typography.body }}>
                {item.message}
              </Text>
            </View>
          );
        }}
      />
      {typing ? (
        <Text style={{ color: colors.muted, fontSize: typography.small }}>Typing...</Text>
      ) : null}
      <View style={{ gap: spacing.sm }}>
        <AppTextInput label="Message" value={draft} onChangeText={updateDraft} />
        <AppButton label="Send" onPress={send} disabled={!draft.trim() || !room} />
      </View>
    </View>
  );
}
