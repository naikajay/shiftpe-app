import { API, getErrorMessage, unwrapApiResponse } from "./api";

export const admin = {
  async listUsers() {
    try {
      const response = await API.get("/admin/users");
      return unwrapApiResponse(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to load users."));
    }
  },

  async listTasks() {
    try {
      const response = await API.get("/admin/tasks");
      return unwrapApiResponse(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to load tasks."));
    }
  },

  async listPayments() {
    try {
      const response = await API.get("/admin/payments");
      return unwrapApiResponse(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to load payments."));
    }
  },

  async listVerifications() {
    try {
      const response = await API.get("/admin/verifications");
      return unwrapApiResponse(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to load verifications."));
    }
  },

  async updateVerification(verificationId: string, status: "approved" | "rejected") {
    try {
      const response = await API.patch(`/admin/verifications/${verificationId}`, { status });
      return unwrapApiResponse(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to update verification."));
    }
  },
};
