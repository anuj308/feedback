import mongoose,{Schema} from "mongoose";

const answerSchema = new Schema({
  questionId: {
    type: String,
    required: true
  },
  answer: Schema.Types.Mixed, // Can be string, array, number, file URL, etc.
  isCorrect: Boolean, // For quiz scoring
  pointsEarned: { type: Number, default: 0 }
});

const responseSchema = new mongoose.Schema(
  {
    formId: {
      type: Schema.Types.ObjectId,
      ref: "Form",
      required: true
    },
    respondentEmail: String,
    respondentUser: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    answers: [answerSchema],
    totalScore: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
    ipAddress: String,
    userAgent: String,
    // Legacy fields for backward compatibility
    data: {
      type: Object,
      default: {}
    },
    Owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    formTitle: {
      type: String
    },
    formDescription: {
      type: String
    },
    feedbackUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
    }
  },
  { timestamps: true }
);

// Alias for backward compatibility
const formStoreSchema = responseSchema;

export const Store = mongoose.model("Store", formStoreSchema);
export const Response = mongoose.model("Response", responseSchema);
