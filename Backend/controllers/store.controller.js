import mongoose from "mongoose";
import { Store } from "../models/store.model.js";
import { Form } from "../models/from.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Store form response with new structure
const storeForm = asyncHandler(async (req, res) => {
  const { formId, answers } = req.body;

  if (!formId) {
    throw new ApiError(400, "Form ID is required");
  }

  if (!answers || !Array.isArray(answers)) {
    throw new ApiError(400, "Answers array is required");
  }

  // Get the form to validate it exists and is accepting responses
  const form = await Form.findById(formId);
  if (!form) {
    throw new ApiError(404, "Form not found");
  }

  if (!form.acceptingResponses) {
    throw new ApiError(400, "This form is no longer accepting responses");
  }

  // Check if form settings require sign-in
  if (form.settings?.requireSignIn && !req.user) {
    throw new ApiError(401, "Sign-in required to submit response");
  }

  // Check for one response limit
  if (form.settings?.limitToOneResponse && req.user) {
    const existingResponse = await Store.findOne({
      formId: formId,
      respondentUser: req.user._id
    });
    
    if (existingResponse) {
      throw new ApiError(400, "You have already submitted a response to this form");
    }
  }

  const responseData = {
    formId,
    answers,
    submittedAt: new Date(),
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  };

  // Calculate quiz score if it's a quiz
  if (form.settings?.isQuiz) {
    let totalScore = 0;
    const questionsMap = new Map();
    
    // Create a map of questions for quick lookup
    if (form.questions) {
      form.questions.forEach(q => questionsMap.set(q.questionId, q));
    }
    
    responseData.answers = answers.map(answer => {
      const question = questionsMap.get(answer.questionId);
      if (question && question.correctAnswer) {
        const isCorrect = answer.answer === question.correctAnswer;
        answer.isCorrect = isCorrect;
        answer.pointsEarned = isCorrect ? (question.points || 1) : 0;
        totalScore += answer.pointsEarned;
      }
      return answer;
    });
    
    responseData.totalScore = totalScore;
  }

  // Set user information
  if (req.user) {
    responseData.respondentUser = req.user._id;
    
    // Set email if form collects emails
    if (form.settings?.collectEmail) {
      responseData.respondentEmail = req.user.email;
    }
  }

  const response = await Store.create(responseData);
  
  if (!response) {
    throw new ApiError(500, "Something went wrong while saving response");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { response }, "Response submitted successfully"));
});

const getAllResponsesByFormId = asyncHandler(async(req,res)=>{
  const {formId} = req.params;
  const { page = 1, limit = 10, detailed = false } = req.query;

  // Verify form exists and user has access
  const form = await Form.findById(formId);
  if (!form) {
    throw new ApiError(404, "Form not found");
  }

  // Check if user owns the form (for admin access)
  if (req.user && form.Owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to view responses for this form");
  }

  let aggregationPipeline = [
    {
      $match:{
        formId: new mongoose.Types.ObjectId(formId)
      }
    }
  ];

  if (detailed === 'true') {
    aggregationPipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "respondentUser",
          foreignField: "_id",
          as: "respondent",
          pipeline: [
            {
              $project: {
                fullName: 1,
                email: 1
              },
            },
          ],
        },
      },
      {
        $addFields: {
          respondent: {
            $first: "$respondent",
          }
        },
      }
    );
  }

  // Add pagination
  aggregationPipeline.push(
    { $sort: { createdAt: -1 } },
    { $skip: (page - 1) * parseInt(limit) },
    { $limit: parseInt(limit) }
  );
  
  const store = await Store.aggregate(aggregationPipeline);
  const totalResponses = await Store.countDocuments({ formId: new mongoose.Types.ObjectId(formId) });
  
  if (!store) {
    throw new ApiError(500,"Something went wrong while fetching responses");
  }

  res.status(200).json(new ApiResponse(200, {
    responses: store,
    totalPages: Math.ceil(totalResponses / limit),
    currentPage: page,
    totalResponses,
    formInfo: {
      formTitle: form.formTitle,
      formDescription: form.formDescription
    }
  }, "Successfully fetched all responses"));
  
});

// Get response analytics by question
const getResponseAnalytics = asyncHandler(async(req, res) => {
  const { formId } = req.params;
  
  const form = await Form.findById(formId);
  if (!form) {
    throw new ApiError(404, "Form not found");
  }

  // Check if user owns the form
  if (form.Owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to view analytics for this form");
  }

  const responses = await Store.find({ formId });
  
  const analytics = {
    formInfo: {
      formId: form._id,
      formTitle: form.formTitle,
      formDescription: form.formDescription,
      totalResponses: responses.length
    },
    questionAnalytics: []
  };

  // Process questions from the new structure
  const questions = form.questions || [];

  questions.forEach((question, index) => {
    const questionResponses = responses.map(response => {
      if (response.answers && Array.isArray(response.answers)) {
        return response.answers.find(answer => answer.questionId === question.questionId);
      }
      return null;
    }).filter(Boolean);

    analytics.questionAnalytics.push({
      questionId: question.questionId,
      question: question.question,
      type: question.type,
      totalResponses: questionResponses.length,
      responses: questionResponses.map(r => r.answer),
      summary: generateQuestionSummary(questionResponses, question.type)
    });
  });

  res.status(200).json(new ApiResponse(200, analytics, "Response analytics generated successfully"));
});

// Helper function to generate question summaries
const generateQuestionSummary = (responses, questionType) => {
  if (responses.length === 0) return {};

  switch (questionType) {
    case 'multipleChoice':
    case 'dropdown':
      const counts = {};
      responses.forEach(response => {
        const answer = response.answer;
        counts[answer] = (counts[answer] || 0) + 1;
      });
      return { distribution: counts };

    case 'checkboxes':
      const optionCounts = {};
      responses.forEach(response => {
        const answer = response.answer;
        if (Array.isArray(answer)) {
          answer.forEach(option => {
            optionCounts[option] = (optionCounts[option] || 0) + 1;
          });
        }
      });
      return { optionDistribution: optionCounts };

    case 'linearScale':
      const ratings = responses.map(r => parseInt(r.answer)).filter(r => !isNaN(r));
      const average = ratings.length > 0 ? ratings.reduce((a, b) => a + b) / ratings.length : 0;
      return { 
        average: Math.round(average * 100) / 100,
        distribution: ratings.reduce((acc, rating) => {
          acc[rating] = (acc[rating] || 0) + 1;
          return acc;
        }, {})
      };

    default:
      return { 
        totalResponses: responses.length,
        sampleResponses: responses.slice(0, 5).map(r => r.answer)
      };
  }
};


const deleteResponses = asyncHandler(async(req,res)=>{
  const {storeId} = req.params;

  // Verify the response exists
  const response = await Store.findById(storeId);
  if (!response) {
    throw new ApiError(404, "Response not found");
  }

  // Get form to check ownership
  const form = await Form.findById(response.formId);
  if (!form) {
    throw new ApiError(404, "Associated form not found");
  }

  // Check if user owns the form or is the respondent
  const isOwner = form.Owner.toString() === req.user._id.toString();
  const isRespondent = response.respondentUser && response.respondentUser.toString() === req.user._id.toString();
  
  if (!isOwner && !isRespondent) {
    throw new ApiError(403, "Not authorized to delete this response");
  }

  // Check if response editing is allowed
  if (isRespondent && !form.settings?.allowResponseEditing) {
    throw new ApiError(400, "Response editing is not allowed for this form");
  }

  const deletedResponse = await Store.findByIdAndDelete(storeId, {new: true});

  res.status(200).json(new ApiResponse(200, deletedResponse, "Successfully deleted the response"));
});

export { 
  storeForm, 
  getAllResponsesByFormId, 
  deleteResponses, 
  getResponseAnalytics 
};
