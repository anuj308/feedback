import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { Form } from "../models/from.model.js";
import { Store } from "../models/store.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// admin
const createForm = asyncHandler(async (req, res) => {
  const { questions, formTitle, formDescription } = req.body;

  if (!questions && !formTitle && !formDescription) {
    throw new ApiError(400, "Form data is required");
  }
  
  const form = await Form.create({
    questions: questions || [],
    formTitle: formTitle || "Untitled Form",
    formDescription: formDescription || "",
    Owner: req.user._id,
  });
  
  if (!form) {
    throw new ApiError(500, "Something went wrong while creating form");
  }
  
  return res
    .status(200)
    .json(new ApiResponse(200, { form }, "Created form successfully"));
});
const updateForm = asyncHandler(async (req, res) => {
  const { questions, formTitle, formDescription, isAutoSave = false } = req.body;
  const { formId } = req.params;

  if (!questions && !formTitle && !formDescription) {
    throw new ApiError(400, "Form data is required");
  }
  
  const updateData = {};
  if (questions) updateData.questions = questions;
  if (formTitle) updateData.formTitle = formTitle;
  if (formDescription) updateData.formDescription = formDescription;
  
  // Update last auto-saved timestamp if this is an auto-save
  if (isAutoSave) {
    updateData['settings.lastAutoSaved'] = new Date();
  }
  
  const form = await Form.findByIdAndUpdate(formId, updateData, { new: true });
  
  if (!form) {
    throw new ApiError(500, "Something went wrong while updating form");
  }
  
  return res
    .status(200)
    .json(new ApiResponse(200, { form }, isAutoSave ? "Form auto-saved successfully" : "Updated form successfully"));
});

const getForm = asyncHandler(async (req, res) => {
  const { formId } = req.params;

  if (!formId) {
    throw new ApiError(400, "id is required");
  }
  
  const form = await Form.findById(formId);

  if (!form) {
    throw new ApiError(404, "Form not found");
  }

  // Check if form is published
  if (!form.isPublished) {
    throw new ApiError(403, "Form is not published");
  }

  // If form requires sign in, check for authentication
  if (form.settings?.requireSignIn) {
    // Try to extract token and verify user
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      throw new ApiError(401, "Authentication required for this form");
    }

    try {
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
      
      if (!user) {
        throw new ApiError(401, "Invalid Access Token");
      }
      
      req.user = user;
    } catch (error) {
      throw new ApiError(401, "Invalid Access Token");
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { form }, "fetched form successfully"));
});

// Get form for editing (owner can access unpublished forms)
const getFormForEdit = asyncHandler(async (req, res) => {
  const { formId } = req.params;

  if (!formId) {
    throw new ApiError(400, "Form ID is required");
  }
  
  const form = await Form.findById(formId);

  if (!form) {
    throw new ApiError(404, "Form not found");
  }

  // Check if user owns the form (only owner can edit)
  if (form.Owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to edit this form");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { form }, "Form fetched for editing successfully"));
});

const getAllFormByOwnerId = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;

  const form = await Form.aggregate([
    {
      $match: {
        Owner: new mongoose.Types.ObjectId(ownerId),
      },
    },
  ]);

  if (!form) {
    throw new ApiError(500, "something went wrong will fetching forms");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { form }, "fetched all form successfully"));
});

const renameForm = asyncHandler(async (req, res) => {
  const { formTitle } = req.body;
  const { formId } = req.params;
  console.log(formId);
  if (!formId) {
    throw new ApiError(400, "id is required");
  }
  if (!formTitle) {
    throw new ApiError(400, "data is required");
  }

  const form = await Form.findByIdAndUpdate(
    formId,
    { formTitle },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, { form }, "succesfully changed the headdata"));
});

const deleteForm = asyncHandler(async (req, res) => {
  const { formId } = req.params;

  if (!formId) {
    throw new ApiError(400, "id is required");
  }
  console.log(formId);

  const form = await Form.findByIdAndDelete(formId, { new: true });

  return res
    .status(200)
    .json(new ApiResponse(200, { form }, "sucessfully deleted the form"));
});

const toogleResponses = asyncHandler(async (req, res) => {
  const { formId} = req.params;

  if (!formId) {
    throw new ApiError(400, "id is required");
  }  
  
  const form = await Form.findById(formId)
  console.log(form.acceptingResponses)

  if(form.acceptingResponses){
    const formR = await Form.findByIdAndUpdate(formId,{acceptingResponses:false},{new:true})
    res.status(200).json(new ApiResponse(200,formR,"Successfully changed accepting responses to false"))
  }else{
    const formR = await Form.findByIdAndUpdate(formId,{acceptingResponses:true},{new:true})
    res.status(200).json(new ApiResponse(200,formR,"Successfully changed accepting responses to true"))
  }
});

// Get responses summary and analytics for a form
const getFormAnalytics = asyncHandler(async (req, res) => {
  const { formId } = req.params;
  
  const form = await Form.findById(formId);
  if (!form) {
    throw new ApiError(404, "Form not found");
  }

  // Check if user owns the form
  if (form.Owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to view analytics for this form");
  }

  // Check if form is published
  if (!form.isPublished) {
    return res.status(200).json(new ApiResponse(200, {
      isPublished: false,
      message: "Publish your form to see analytics",
      formTitle: form.formTitle
    }, "Form not published"));
  }

  const responses = await Store.find({ formId }).populate('respondentUser', 'fullName email');
  
  const analytics = {
    isPublished: true,
    formInfo: {
      formId: form._id,
      formTitle: form.formTitle,
      formDescription: form.formDescription,
      createdAt: form.createdAt,
      acceptingResponses: form.acceptingResponses,
      isPublished: form.isPublished
    },
    totalResponses: responses.length,
    completionRate: responses.length > 0 ? 100 : 0, // Can be enhanced with partial responses tracking
    averageScore: null, // For quiz forms
    questionStats: [],
    responseRate: {
      daily: {},
      weekly: {},
      monthly: {}
    }
  };

  // Calculate response rates by time periods
  responses.forEach(response => {
    const date = new Date(response.createdAt);
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    analytics.responseRate.daily[dateKey] = (analytics.responseRate.daily[dateKey] || 0) + 1;
    analytics.responseRate.weekly[weekKey] = (analytics.responseRate.weekly[weekKey] || 0) + 1;
    analytics.responseRate.monthly[monthKey] = (analytics.responseRate.monthly[monthKey] || 0) + 1;
  });

  // Process questions from the new structure
  const questions = form.questions || [];

  analytics.questionStats = questions.map((question, index) => {
    const questionResponses = responses.map(response => {
      if (response.answers && Array.isArray(response.answers)) {
        return response.answers.find(answer => answer.questionId === question.questionId);
      }
      return null;
    }).filter(Boolean);

    let questionAnalytics = {
      questionId: question.questionId,
      question: question.question,
      type: question.type,
      required: question.required || false,
      totalResponses: questionResponses.length,
      responseCount: questionResponses.length,
      skippedCount: responses.length - questionResponses.length,
      responses: questionResponses.map(r => r.answer)
    };

    // Add specific analytics based on question type
    if (question.type === 'multipleChoice' || question.type === 'dropdown') {
      const answerCounts = {};
      questionResponses.forEach(response => {
        const answer = response.answer;
        answerCounts[answer] = (answerCounts[answer] || 0) + 1;
      });
      questionAnalytics.answerDistribution = answerCounts;
      
      // Create option breakdown for charts
      questionAnalytics.optionBreakdown = Object.keys(answerCounts).map(option => ({
        option: option,
        count: answerCounts[option]
      }));
      
      // Calculate percentages
      questionAnalytics.answerPercentages = {};
      Object.keys(answerCounts).forEach(answer => {
        questionAnalytics.answerPercentages[answer] = 
          ((answerCounts[answer] / questionResponses.length) * 100).toFixed(1);
      });
    }

    if (question.type === 'checkbox') {
      const optionCounts = {};
      questionResponses.forEach(response => {
        const answer = response.answer;
        if (Array.isArray(answer)) {
          answer.forEach(option => {
            optionCounts[option] = (optionCounts[option] || 0) + 1;
          });
        } else if (typeof answer === 'string' && answer.startsWith('[')) {
          // Handle stringified arrays
          try {
            const parsed = JSON.parse(answer);
            if (Array.isArray(parsed)) {
              parsed.forEach(option => {
                optionCounts[option] = (optionCounts[option] || 0) + 1;
              });
            }
          } catch (e) {
            // Handle as single option
            optionCounts[answer] = (optionCounts[answer] || 0) + 1;
          }
        } else if (answer) {
          // Handle single option
          optionCounts[answer] = (optionCounts[answer] || 0) + 1;
        }
      });
      questionAnalytics.optionDistribution = optionCounts;
      
      // Create option breakdown for charts
      questionAnalytics.optionBreakdown = Object.keys(optionCounts).map(option => ({
        option: option,
        count: optionCounts[option]
      }));
      
      // Calculate percentages for checkboxes
      questionAnalytics.optionPercentages = {};
      Object.keys(optionCounts).forEach(option => {
        questionAnalytics.optionPercentages[option] = 
          ((optionCounts[option] / questionResponses.length) * 100).toFixed(1);
      });
    }

    if (question.type === 'shortAnswer' || question.type === 'paragraph') {
      // For text responses, provide word count analysis
      const wordCounts = questionResponses.map(response => {
        const answer = response.answer || '';
        return answer.toString().split(/\s+/).filter(word => word.length > 0).length;
      });
      
      if (wordCounts.length > 0) {
        questionAnalytics.textAnalytics = {
          averageWordCount: (wordCounts.reduce((sum, count) => sum + count, 0) / wordCounts.length).toFixed(1),
          minWordCount: Math.min(...wordCounts),
          maxWordCount: Math.max(...wordCounts),
          totalWords: wordCounts.reduce((sum, count) => sum + count, 0)
        };
      }
    }

    // Calculate response rate for this question
    questionAnalytics.responseRate = ((questionResponses.length / responses.length) * 100).toFixed(1);

    return questionAnalytics;
  });

  // Calculate quiz-specific analytics if this is a quiz
  if (form.settings && form.settings.isQuiz) {
    let totalScore = 0;
    let scoredResponses = 0;

    responses.forEach(response => {
      if (response.score !== undefined && response.score !== null) {
        totalScore += response.score;
        scoredResponses++;
      }
    });

    if (scoredResponses > 0) {
      analytics.averageScore = (totalScore / scoredResponses).toFixed(1);
    }
  }

  // Also add questionAnalytics for frontend compatibility
  analytics.questionAnalytics = analytics.questionStats;

  res.status(200).json(new ApiResponse(200, analytics, "Form analytics retrieved successfully"));
});

// Get individual responses for a form with pagination
const getFormResponses = asyncHandler(async (req, res) => {
  const { formId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const form = await Form.findById(formId);
  if (!form) {
    throw new ApiError(404, "Form not found");
  }

  // Check if user owns the form
  if (form.Owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to view responses for this form");
  }

  const responses = await Store.find({ formId })
    .populate('respondentUser', 'fullName email')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const totalResponses = await Store.countDocuments({ formId });

  // Enhance response data with question information
  const enhancedResponses = responses.map(response => {
    const enhancedAnswers = response.answers ? response.answers.map(answer => {
      // Find the corresponding question
      const question = form.questions.find(q => q.questionId === answer.questionId);
      
      // Convert Mongoose document to plain object if needed
      const answerObj = answer.toObject ? answer.toObject() : answer;
      
      return {
        ...answerObj,
        question: question ? question.question : `Question ${answer.questionId}`,
        questionType: question ? question.type : 'unknown'
      };
    }) : [];

    return {
      ...response.toObject(),
      answers: enhancedAnswers,
      respondentName: response.respondentUser ? response.respondentUser.fullName : 'Anonymous',
      respondentEmail: response.respondentUser ? response.respondentUser.email : null
    };
  });

  res.status(200).json(new ApiResponse(200, {
    responses: enhancedResponses,
    totalPages: Math.ceil(totalResponses / limit),
    currentPage: parseInt(page),
    totalResponses,
    hasNextPage: page < Math.ceil(totalResponses / limit),
    hasPrevPage: page > 1,
    formInfo: {
      formTitle: form.formTitle,
      formDescription: form.formDescription,
      questionCount: form.questions ? form.questions.length : 0
    }
  }, "Form responses retrieved successfully"));
});

// Delete all responses for a form
const deleteAllResponses = asyncHandler(async (req, res) => {
  const { formId } = req.params;

  if (!formId) {
    throw new ApiError(400, "Form ID is required");
  }

  const form = await Form.findById(formId);
  if (!form) {
    throw new ApiError(404, "Form not found");
  }

  // Check if user owns the form
  if (form.Owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to delete responses for this form");
  }

  // Delete all responses for this form
  const deleteResult = await Store.deleteMany({ formId });

  res.status(200).json(new ApiResponse(200, {
    deletedCount: deleteResult.deletedCount,
    formId: formId
  }, `Successfully deleted ${deleteResult.deletedCount} responses`));
});

// Update form settings
const updateFormSettings = asyncHandler(async (req, res) => {
  const { formId } = req.params;
  const { settings, acceptingResponses } = req.body;

  if (!formId) {
    throw new ApiError(400, "Form ID is required");
  }

  const form = await Form.findById(formId);
  if (!form) {
    throw new ApiError(404, "Form not found");
  }

  // Check if user owns the form
  if (form.Owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to update this form");
  }

  const updateData = {};
  
  // Update settings if provided
  if (settings) {
    updateData.settings = { ...form.settings.toObject(), ...settings };
  }
  
  // Update acceptingResponses if provided
  if (typeof acceptingResponses !== 'undefined') {
    updateData.acceptingResponses = acceptingResponses;
  }

  const updatedForm = await Form.findByIdAndUpdate(
    formId,
    { $set: updateData },
    { new: true }
  );

  res.status(200).json(new ApiResponse(200, updatedForm, "Form settings updated successfully"));
});

// Publish form endpoint
const publishForm = asyncHandler(async (req, res) => {
  const { formId } = req.params;
  const { settings } = req.body;

  if (!formId) {
    throw new ApiError(400, "Form ID is required");
  }

  const form = await Form.findById(formId);
  if (!form) {
    throw new ApiError(404, "Form not found");
  }

  // Check if user owns the form
  if (form.Owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to publish this form");
  }

  const updateData = {
    isPublished: true,
    acceptingResponses: true
  };
  
  // Update settings if provided
  if (settings) {
    updateData.settings = { ...form.settings.toObject(), ...settings };
  }

  const updatedForm = await Form.findByIdAndUpdate(
    formId,
    { $set: updateData },
    { new: true }
  );

  res.status(200).json(new ApiResponse(200, updatedForm, "Form published successfully"));
});


export {
  createForm,
  getForm,
  getFormForEdit,
  getAllFormByOwnerId,
  renameForm,
  deleteForm,
  updateForm,
  toogleResponses,
  getFormAnalytics,
  getFormResponses,
  updateFormSettings,
  deleteAllResponses,
  publishForm
};
