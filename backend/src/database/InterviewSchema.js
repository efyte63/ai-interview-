import mongoose from "mongoose";

const InterviewSchema = new mongoose.Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },

    Interviewid: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

const InterviewModel = mongoose.model("Interviewdata", InterviewSchema);

export default InterviewModel;
