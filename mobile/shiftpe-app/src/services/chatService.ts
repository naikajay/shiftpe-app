import { tasks } from "./tasks";

export const chatService = {
  getRequestChatRoom: tasks.getRequestChatRoom,
  getMessages: tasks.getMessages,
  sendMessage: tasks.sendMessage,
};
