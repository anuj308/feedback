import mongoose,{Schema} from "mongoose";

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
    data: {
      type:Object,
      default:{}
    }
  },
  { timestamps: true }
);

export const Form = mongoose.model("Form", formSchema);
