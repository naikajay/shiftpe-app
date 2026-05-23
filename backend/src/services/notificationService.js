const Notification = require("../models/Notification");
const { emitToUser } = require("../sockets/socket");
const User = require("../models/User");

const sendExpoPush = async (userId, notification) => {
  const user = await User.findById(userId).select("expoPushToken");

  if (!user?.expoPushToken || !user.expoPushToken.startsWith("ExponentPushToken")) {
    return;
  }

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: user.expoPushToken,
      title: notification.title,
      body: notification.message,
      data: {
        type: notification.type,
        entityType: notification.entityType,
        entityId: notification.entityId,
      },
    }),
  }).catch(() => undefined);
};

const createNotification = async (payload, options = {}) => {
  const notification = await Notification.create([payload], {
    session: options.session,
  });

  const created = notification[0];
  emitToUser(String(created.userId), "notification:new", created);
  sendExpoPush(created.userId, created);
  return created;
};

const createNotifications = async (payloads, options = {}) => {
  if (!payloads.length) {
    return [];
  }

  const notifications = await Notification.insertMany(payloads, {
    session: options.session,
    ordered: false,
  });

  notifications.forEach((notification) => {
    emitToUser(String(notification.userId), "notification:new", notification);
    sendExpoPush(notification.userId, notification);
  });

  return notifications;
};

const getUserNotifications = async (userId, query = {}) => {
  const filter = { userId };
  const limit = Number(query.limit) || 50;

  if (query.read !== undefined) {
    filter.read = query.read === "true" || query.read === true;
  }

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(Math.min(limit, 100));

  return notifications;
};

const markNotificationAsRead = async (userId, notificationId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { $set: { read: true, readAt: new Date() } },
    { returnDocument: "after", runValidators: true }
  );
};

const markNotificationsAsRead = async (userId, notificationIds = []) => {
  const filter = { userId, read: false };

  if (notificationIds.length) {
    filter._id = { $in: notificationIds };
  }

  await Notification.updateMany(filter, {
    $set: { read: true, readAt: new Date() },
  });

  return getUserNotifications(userId, { read: false });
};

module.exports = {
  createNotification,
  createNotifications,
  getUserNotifications,
  markNotificationAsRead,
  markNotificationsAsRead,
};
