import mongoose from "mongoose";
import { Store } from "../models/store.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// admin
const storeForm = asyncHandler(async (req, res) => {
  const { data, ownerId, formTitle, formDescription } = req.body;

  if (!data && !headData) {
    throw new ApiError(400, "data is required");
  }
  const form = await Store.create({
    data,
    Owner: ownerId,
    formTitle,
    formDescription,
    feedbackUser:req.user._id,
  });
  if (!form) {
    throw new ApiError(500, "something went wrong will saving response ");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { form }, "got response successfully"));
});

export { storeForm };
