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
    userAgent: String
  },
  { timestamps: true }
);

export const Store = mongoose.model("Store", responseSchema);
export const Response = mongoose.model("Response", responseSchema);
