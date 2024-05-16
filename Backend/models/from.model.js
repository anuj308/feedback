import mongoose, { Schema } from "mongoose";

const formSchema = new mongoose.Schema(
  {
    Owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    // feedbackUser: {
    //   type: Schema.Types.ObjectId,
    //   ref: "User",
    // },
    headData: {
      type: Object,
      default: {},
    },
    data: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

export const Form = mongoose.model("Form", formSchema);
