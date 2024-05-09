import mongoose from "mongoose";

const formStoreSchema = new mongoose.Schema(
  {
    data: {
      type:Object,
      default:{}
    },
    Owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    feedbackUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const formStore = mongoose.model("fomrStore",formStoreSchema)
