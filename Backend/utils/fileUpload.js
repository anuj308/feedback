import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// cloudinary.config({
//   cloud_name: `${process.env.CLOUDINARY_CLOUD_NAME}`,
//   api_key: `${process.env.CLOUDINARY_API_KEY}`,
//   api_secret: `${process.env.CLOUDINARY_API_SECRET}`,
// });

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

cloudinary.config({
  cloud_name: 'dxee5pfbx',
  api_key: '741832227885216',
  api_secret: 'mVznYGE-hAqLv5BvT5Me9i-YarI'
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.error("No local file path provided.");
      return null;
    }

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // Delete local file after successful upload
    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);

    if (fs.existsSync(localFilePath)) {
      // Delete local file if it exists
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
};

// const uploadOnCloudinary = async (localFilePath) => {
//   try {
//     if (!localFilePath) return null;
//     const response = await cloudinary.uploader.upload(localFilePath, {
//       resource_type: "auto",
//     });
//     // console.log("file is uploaded in cloudinary ", response.url);
//     fs.unlinkSync(localFilePath)
//     return response;
//   } catch (error) {
//     fs.unlinkSync(localFilePath)// remove the  locally saved file as upload operation got failed
//     return null;
//   }
// };

export { uploadOnCloudinary };
