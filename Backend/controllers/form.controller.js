import mongoose from "mongoose";
import { Form } from "../models/from.model.js";
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


export {
  createForm,
  getForm,
  getAllFormByOwnerId,
  renameForm,
  deleteForm,
  updateForm,
  toogleResponses
};
