import mongoose, { Schema } from "mongoose";

const questionSchema = new Schema({
  questionId: {
    type: String,
    required: true,
    default: () => `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  type: {
    type: String,
    enum: ["shortAnswer", "paragraph", "multipleChoice", "checkboxes", "dropdown", "fileUpload", "linearScale", "multipleChoiceGrid"],
    required: true,
    default: "shortAnswer"
  },
  question: {
    type: String,
    required: true,
    default: ""
  },
  description: {
    type: String,
    default: ""
  },
  titlePlaceholder: {
    type: String,
    default: "Question"
  },
  descriptionPlaceholder: {
    type: String,
    default: "Description"
  },
  required: {
    type: Boolean,
    default: false
  },
  options: [String], // For multiple choice, checkboxes, dropdown
  correctAnswer: String, // For quiz mode
  points: {
    type: Number,
    default: 0
  },
  settings: {
    shuffleOptions: { type: Boolean, default: false },
    allowOther: { type: Boolean, default: false }
  }
}, { timestamps: true });

const formSchema = new mongoose.Schema(
  {
    Owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    formTitle: {
      type: String,
      required: true,
      default:'Untitled Form'
    },
    formDescription: {
      type: String,
      default:''
    },
    questions: {
      type: [questionSchema],
      default: []
    },
    settings: {
      isQuiz: { type: Boolean, default: false },
      collectEmail: { type: Boolean, default: false },
      requireSignIn: { type: Boolean, default: false },
      limitToOneResponse: { type: Boolean, default: false },
      allowResponseEditing: { type: Boolean, default: true },
      showProgressBar: { type: Boolean, default: false },
      shuffleQuestions: { type: Boolean, default: false },
      confirmationMessage: { type: String, default: "Thank you for your response!" },
      showResultsSummary: { type: Boolean, default: false },
      disableAutoSave: { type: Boolean, default: false },
      autoSaveInterval: { type: Number, default: 2000 }, // milliseconds
      lastAutoSaved: { type: Date, default: Date.now },
      allowedEmails: [String] // For restricted access
    },
    acceptingResponses: {
      type: Boolean,
      default: true,
    },  
  },
  { timestamps: true }
);

export const Form = mongoose.model("Form", formSchema);
