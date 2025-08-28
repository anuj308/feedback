import mongoose from "mongoose";
import { Store } from "../models/store.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// admin
const storeForm = asyncHandler(async (req, res) => {
  const { data, ownerId,formId, formTitle, formDescription } = req.body;

  if (!data && !headData) {
    throw new ApiError(400, "data is required");
  }
  const form = await Store.create({
    data,
    Owner: ownerId,
    formTitle,
    formDescription,
    feedbackUser:req.user._id,
    formId
  });
  if (!form) {
    throw new ApiError(500, "something went wrong will saving response ");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { form }, "got response successfully"));
});

const getAllResponsesByFormId = asyncHandler(async(req,res)=>{
  const {formId} = req.params;
  const store = await Store.aggregate([
    {
      $match:{
        formId: new mongoose.Types.ObjectId(formId)
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "Owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullName: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
  ])
  
  if (!store) {
    throw new ApiError(500,"something went wrong")
  }

  res.status(200).json(new ApiResponse(200,store,"sucessfully fetched all the responses"))
  
})


const deleteResponses = asyncHandler(async(req,res)=>{
  const {storeId} = req.params;

  const store = await Store.findByIdAndDelete(storeId,{new:true})

  res.status(200).json(new ApiResponse(200,store,"Successfully deleted the response"))
})
export { storeForm,getAllResponsesByFormId,deleteResponses };
