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
    formTitle: {
      type: String,
      required: true,
      default:'Untitled Form'
    },
    formDescription: {
      type: String,
      required: true,
      default:'No Description'
    },
    data: {
      type: Array,
      default: [
        {
          data: {
            id: 1232212,
            question: "",
            titlePlaceholder: "Question",
            description: "",
            descriptionPlaceholder: "Description",
            option: "Shortanswer",
            required: false,
            select: true,
            name1: "question",
            name2: "description",
          },
          id: 1232212,
          multipleChoice: [{ index: 68798, value: "", id: Date.now() }],
          checkBoxes: [{ index: 156787, value: "", id: Date.now() }],
        },
      ],
    },
    acceptingResponses: {
      type: Boolean,
      default: false,
    },  
  },
  { timestamps: true }
);

export const Form = mongoose.model("Form", formSchema);
