const mongoose = require("mongoose");

const chatRoomSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    lastMessageAt: {
      type: Date,
      default: null,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

chatRoomSchema.index({ taskId: 1, participants: 1 });
chatRoomSchema.index({ participants: 1, updatedAt: -1 });
chatRoomSchema.index({ taskId: 1 }, { unique: true });

module.exports = mongoose.model("ChatRoom", chatRoomSchema);
