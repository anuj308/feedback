import mongoose,{Schema} from "mongoose";

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

export const Store = mongoose.model("Store",formStoreSchema)