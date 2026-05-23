import { API, getErrorMessage, unwrapApiResponse } from "./api";

export const notificationService = {
  async getNotifications(query: { read?: boolean; limit?: number } = {}) {
    try {
      const response = await API.get("/notifications", { params: query });
      return unwrapApiResponse(response.data).notifications ?? [];
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to load notifications."));
    }
  },

  async markAsRead(notificationId: string) {
    try {
      const response = await API.patch(`/notifications/${notificationId}/read`);
      return unwrapApiResponse(response.data).notification;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to mark notification read."));
    }
  },

  async markManyAsRead(notificationIds: string[] = []) {
    try {
      const response = await API.patch("/notifications/read", { notificationIds });
      return unwrapApiResponse(response.data).notifications ?? [];
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to mark notifications read."));
    }
  },
};
