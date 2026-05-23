import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import AppTextInput from "../components/AppTextInput";
import ChatBubble from "../components/chat/ChatBubble";
import ErrorMessage from "../components/ErrorMessage";
import { colors, spacing, typography } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useChatStore } from "../store/chatStore";
import { useSocketStore } from "../store/socketStore";

export default function ChatScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "Chat">>();
  const navigation = useNavigation();
  const { user } = useAuth();
  const [draft, setDraft] = useState("");

  const room = useChatStore((state) => state.roomsByRequestId[route.params.requestId]);
  const messagesByRoomId = useChatStore((state) => state.messagesByRoomId);
  const typingByRoomId = useChatStore((state) => state.typingByRoomId);
  const onlineByRoomId = useChatStore((state) => state.onlineByRoomId);
  const seenAtByRoomId = useChatStore((state) => state.seenAtByRoomId);
  const loading = useChatStore((state) => state.loading);
  const sending = useChatStore((state) => state.sending);
  const error = useChatStore((state) => state.error);
  const loadRequestChat = useChatStore((state) => state.loadRequestChat);
  const loadMessages = useChatStore((state) => state.loadMessages);
  const joinRoom = useChatStore((state) => state.joinRoom);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const sendTyping = useChatStore((state) => state.sendTyping);
  const markSeen = useChatStore((state) => state.markSeen);
  const connected = useSocketStore((state) => state.connected);

  const roomId = room?._id;
  const messages = useMemo(() => (roomId ? messagesByRoomId[roomId] ?? [] : []), [messagesByRoomId, roomId]);
  const typing = roomId ? Boolean(typingByRoomId[roomId]) : false;
  const online = roomId ? Boolean(onlineByRoomId[roomId]) : connected;
  const seenAt = roomId ? seenAtByRoomId[roomId] : null;

  const loadChat = async () => {
    const nextRoom = await loadRequestChat(route.params.requestId);
    await loadMessages(nextRoom._id);
    await joinRoom(nextRoom._id);
  };

  useEffect(() => {
    loadChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params.requestId]);

  useEffect(() => {
    if (!roomId) return;
    joinRoom(roomId);
    markSeen(roomId);
  }, [joinRoom, markSeen, roomId]);

  const updateDraft = (value: string) => {
    setDraft(value);
    if (roomId) {
      sendTyping(roomId, value.trim().length > 0);
    }
  };

  const send = async () => {
    if (!roomId || !draft.trim()) return;
    const text = draft.trim();
    setDraft("");
    sendTyping(roomId, false);
    await sendMessage(roomId, text);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ backgroundColor: colors.surface, flex: 1 }}>
      <View style={{ backgroundColor: colors.white, borderBottomColor: colors.border, borderBottomWidth: 1, padding: spacing.lg, paddingTop: spacing.xl }}>
        <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.md }}>
          <TouchableOpacity activeOpacity={0.86} onPress={navigation.goBack} style={iconButtonStyle}>
            <Ionicons name="chevron-back" color={colors.text} size={23} />
          </TouchableOpacity>
          <View style={{ alignItems: "center", backgroundColor: colors.accentSoft, borderRadius: 18, height: 52, justifyContent: "center", width: 52 }}>
            <Ionicons name="shield-checkmark" color={colors.accent} size={25} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: typography.body, fontWeight: "900" }}>Shift chat</Text>
            <Text style={{ color: colors.success, fontSize: typography.small, fontWeight: "800" }}>
              {typing ? "Typing..." : online ? "Online now" : "Realtime connecting"}
            </Text>
          </View>
        </View>
      </View>

      <ErrorMessage message={error} />
      <FlatList
        data={messages}
        inverted
        keyExtractor={(item) => item._id}
        refreshing={loading}
        onRefresh={loadChat}
        contentContainerStyle={{ gap: spacing.sm, padding: spacing.lg }}
        renderItem={({ item }) => {
          const mine = typeof item.senderId === "string" ? item.senderId === user?._id : item.senderId._id === user?._id;
          return <ChatBubble message={item.message} mine={mine} />;
        }}
      />
      {seenAt ? (
        <Text style={{ color: colors.muted, fontSize: typography.small, paddingHorizontal: spacing.lg, textAlign: "right" }}>Seen</Text>
      ) : null}

      <View style={{ backgroundColor: colors.white, borderTopColor: colors.border, borderTopWidth: 1, flexDirection: "row", gap: spacing.sm, padding: spacing.md }}>
        <View style={{ flex: 1 }}>
          <AppTextInput label="Message" value={draft} onChangeText={updateDraft} placeholder="Ask about arrival, dress code, payout..." editable={!sending} />
        </View>
        <TouchableOpacity
          activeOpacity={0.86}
          disabled={!draft.trim() || !roomId || sending}
          onPress={send}
          style={{ alignItems: "center", alignSelf: "flex-end", backgroundColor: draft.trim() && roomId && !sending ? colors.accent : colors.border, borderRadius: 999, height: 54, justifyContent: "center", width: 54 }}
        >
          <Ionicons name="send" color={colors.white} size={20} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const iconButtonStyle = {
  alignItems: "center" as const,
  backgroundColor: colors.surface,
  borderRadius: 999,
  height: 44,
  justifyContent: "center" as const,
  width: 44,
};
