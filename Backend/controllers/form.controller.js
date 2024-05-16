import mongoose from "mongoose";
import { Form } from "../models/from.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// admin
const createForm = asyncHandler(async (req,res)=>{
    const {data ,headData} = req.body;
    const {ownerId} = req.user._id;
    // console.log("created form inside")
    if (!data && !headData) {
        throw new ApiError(400,"data is required")
    }
    const form = await Form.create({data,headData,Owner:ownerId})
    if (!form) {
        throw new ApiError(500,"something went wrong will creating form")
    }
    return res.status(200).json(new ApiResponse(200,{form},"created form successfully"))
})



export {createForm}