const Notification = require("../models/Notification");
const { emitToUser } = require("../sockets/socket");

const createNotification = async (payload, options = {}) => {
  const notification = await Notification.create([payload], {
    session: options.session,
  });

  const created = notification[0];
  emitToUser(String(created.userId), "notification:new", created);
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

module.exports = {
  createNotification,
  createNotifications,
  getUserNotifications,
  markNotificationAsRead,
};
