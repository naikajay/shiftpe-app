import { Task } from "../types/task";

export const shiftImages = [
  "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=900&q=80",
];

export const categories = [
  { label: "Cafe", icon: "cafe-outline" },
  { label: "Retail", icon: "storefront-outline" },
  { label: "Delivery", icon: "bicycle-outline" },
  { label: "Events", icon: "ticket-outline" },
  { label: "Creator", icon: "videocam-outline" },
  { label: "Tutor", icon: "school-outline" },
];

export const filters = ["Online", "Evening", "Weekend", "Near Campus", "Work From Home", "Urgent", "High Pay"];

export const formatPay = (task: Pick<Task, "payAmount" | "payType">) => {
  const amount = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  }).format(task.payAmount);

  if (task.payType === "fixed") return amount;
  return `${amount}/${task.payType === "daily" ? "day" : "hr"}`;
};

export const formatDistance = (distanceMeters?: number) => {
  if (distanceMeters === undefined || distanceMeters === null) return "Near you";
  if (distanceMeters < 1000) return `${Math.round(distanceMeters)} m away`;
  return `${(distanceMeters / 1000).toFixed(1)}km away`;
};

export const formatShiftWindow = (startTime: string, endTime?: string) => {
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : null;
  const date = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(start);
  const startLabel = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(start);
  const endLabel = end ? new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(end) : "";
  return endLabel ? `${date} • ${startLabel} - ${endLabel}` : `${date} • ${startLabel}`;
};

export const getCompanyName = (task: Partial<Task> & { taskProvider?: { fullName?: string } | null }, index = 0) => {
  const provider = task.taskProviderId;
  if (typeof provider === "object" && provider?.fullName) return provider.fullName;
  if (task.taskProvider?.fullName) return task.taskProvider.fullName;
  return "ShiftPe hirer";
};

export const getShiftImage = (task: Partial<Task>, index = 0) => {
  const key = `${task._id ?? task.title ?? index}`;
  const hash = key.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return shiftImages[hash % shiftImages.length];
};

export const getTags = (task: Pick<Task, "category" | "startTime" | "payAmount">) => {
  const hour = new Date(task.startTime).getHours();
  const tags = [task.category || "Shift"];
  if (hour >= 17) tags.push("Evening");
  if (task.payAmount >= 1000 || task.payAmount >= 150) tags.push("High Pay");
  tags.push("Urgent");
  return tags.slice(0, 4);
};

export const getMatchScore = (task: Pick<Task, "title" | "category" | "payAmount">, index = 0) => {
  const seed = `${task.title}${task.category}${task.payAmount}${index}`;
  const hash = seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return 68 + (hash % 25);
};
