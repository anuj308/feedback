import mongoose from "mongoose";
import { Form } from "../models/from.model.js";
import { Store, Response } from "../models/store.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// admin
const createForm = asyncHandler(async (req, res) => {
  const { data, formTitle, formDescription } = req.body;

  if (!data && !headData && !formTitle && !formDescription) {
    throw new ApiError(400, "data is required");
  }
  const form = await Form.create({
    data,
    formTitle,
    formDescription,
    Owner: req.user._id,
  });
  if (!form) {
    throw new ApiError(500, "something went wrong will creating form");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { form }, "created form successfully"));
});
const updateForm = asyncHandler(async (req, res) => {
  const { data, formTitle, formDescription } = req.body;
  const { formId } = req.params;

  if (!data && !headData && !formTitle && !formDescription) {
    throw new ApiError(400, "data is required");
  }
  const form = await Form.findByIdAndUpdate(formId, {
    data,
    formTitle,
    formDescription,
  });
  if (!form) {
    throw new ApiError(500, "something went wrong will updating form");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { form }, "updated form successfully"));
});

const getForm = asyncHandler(async (req, res) => {
  const { formId } = req.params;

  if (!formId) {
    throw new ApiError(400, "id is required");
  }
  const form = await Form.findById(formId);

  if (!form) {
    throw new ApiError(500, "something went wrong will fetching form");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { form }, "fetched form successfully"));
});

const getAllFormByOwnerId = asyncHandler(async (req, res) => {
  const { ownerId } = req.params;

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

  const responses = await Store.find({ formId });
  
  const analytics = {
    formInfo: {
      formId: form._id,
      formTitle: form.formTitle,
      formDescription: form.formDescription,
      createdAt: form.createdAt,
      acceptingResponses: form.acceptingResponses
    },
    totalResponses: responses.length,
    questions: []
  };

  // Handle both new questions structure and legacy data structure
  const questions = form.questions && form.questions.length > 0 ? form.questions : 
    (form.data && form.data.length > 0 ? form.data : []);

  analytics.questions = questions.map((question, index) => {
    let questionId, questionText, questionType;
    
    // Handle new structure
    if (question.questionId) {
      questionId = question.questionId;
      questionText = question.question;
      questionType = question.type;
    } 
    // Handle legacy structure
    else {
      questionId = question.id || `legacy_${index}`;
      questionText = question.data ? question.data.question : question.question || '';
      questionType = question.data ? question.data.option : question.type || 'shortAnswer';
    }

    const questionResponses = responses.map(response => {
      // Try new structure first
      if (response.answers && Array.isArray(response.answers)) {
        return response.answers.find(answer => answer.questionId === questionId);
      }
      // Fall back to legacy structure
      else if (response.data && typeof response.data === 'object') {
        return response.data[questionId] || response.data[`question_${index}`];
      }
      return null;
    }).filter(Boolean);

    let questionAnalytics = {
      questionId: questionId,
      question: questionText,
      type: questionType,
      totalResponses: questionResponses.length,
      responses: questionResponses.map(r => r.answer || r)
    };

    // Add specific analytics based on question type
    if (questionType === 'multipleChoice' || questionType === 'dropdown') {
      const answerCounts = {};
      questionResponses.forEach(response => {
        const answer = response.answer || response;
        answerCounts[answer] = (answerCounts[answer] || 0) + 1;
      });
      questionAnalytics.answerDistribution = answerCounts;
    }

    if (questionType === 'checkboxes') {
      const optionCounts = {};
      questionResponses.forEach(response => {
        const answer = response.answer || response;
        if (Array.isArray(answer)) {
          answer.forEach(option => {
            optionCounts[option] = (optionCounts[option] || 0) + 1;
          });
        }
      });
      questionAnalytics.optionDistribution = optionCounts;
    }

    return questionAnalytics;
  });

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
    .populate('feedbackUser', 'fullName email')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const totalResponses = await Store.countDocuments({ formId });

  res.status(200).json(new ApiResponse(200, {
    responses,
    totalPages: Math.ceil(totalResponses / limit),
    currentPage: page,
    totalResponses,
    formInfo: {
      formTitle: form.formTitle,
      formDescription: form.formDescription
    }
  }, "Form responses retrieved successfully"));
});

// Update form settings
const updateFormSettings = asyncHandler(async (req, res) => {
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
    throw new ApiError(403, "Not authorized to update this form");
  }

  const updatedForm = await Form.findByIdAndUpdate(
    formId,
    { 
      $set: { 
        settings: { ...form.settings, ...settings } 
      } 
    },
    { new: true }
  );

  res.status(200).json(new ApiResponse(200, updatedForm, "Form settings updated successfully"));
});


export {
  createForm,
  getForm,
  getAllFormByOwnerId,
  renameForm,
  deleteForm,
  updateForm,
  toogleResponses,
  getFormAnalytics,
  getFormResponses,
  updateFormSettings
};
