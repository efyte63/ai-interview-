import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    Interviewid: {
      type: String,
      required: true,
      index: true,
    },

    messagefrom: {
      type: String,
      enum: ["Ai", "User"],
      required: true,
    },

    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const MessageModel = mongoose.model("CONVO", MessageSchema);

export default MessageModel;
