import Constants from "expo-constants";
import { Platform } from "react-native";

import { auth } from "./auth";

export const registerPushNotifications = async () => {
  const isExpoGoAndroid =
    Platform.OS === "android" && Constants.appOwnership === "expo";

  if (Platform.OS === "web" || isExpoGoAndroid) {
    return null;
  }

  const Notifications = await import("expo-notifications");

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ||
    Constants.easConfig?.projectId;

  const token = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined
  );

  await auth.updatePushToken(token.data);
  return token.data;
};
