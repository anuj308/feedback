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
    formTitle:{
      type:String,
      required:true
    },
    formDescription:{
      type:String,
      required:true
    },
    data: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

export const Form = mongoose.model("Form", formSchema);
