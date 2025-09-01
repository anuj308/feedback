import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validationBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while genarating refresh and accces token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  if ([fullName, email, password].some((fields) => fields?.trim() === "")) {
    throw new ApiError(400, "all field are required");
  }

  const existedUser = await User.findOne({ email });

  if (existedUser) {
    throw new ApiError(409, "User with email and userName already exists");
  }
  // const  avatarLocalPath  = req.file.path;
  // console.log(req.file.path);
  // console.log(avatarLocalPath);
  // if (!avatarLocalPath) {
  //   throw new ApiError(400, "avatar file is required");
  // }

  // const avatar = await uploadOnCloudinary(avatarLocalPath);
  // console.log(avatar)
  // if (!avatar) {
  //   throw new ApiError(400, "avatar file is required");
  // }

  const user = await User.create({
    fullName,
    // avatar: avatar.url,
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -RefreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(400, "email is required");
  }

  const user = await User.findOne({
    email,
  });

  if (!user) {
    throw new ApiError(404, "user does not exixt");
  }

  const isPasswordVaild = await user.isPasswordCorrect(password);

  if (!isPasswordVaild) {
    console.log();
    throw new ApiError(401, "invalid password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {

  console.log(req.user._id)
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incommingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incommingRefreshToken) {
    throw new ApiError(404, "Unauthorized request");
  }
  try {
    const decodedToken = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "invalid refresh Token");
    }

    if (incommingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is expried or used");
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid access token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "old password is not correct");
  }

  user.password = newPassword;
  await user.save({ validationBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, "password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, " current user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  // console.log(fullName,email); //for testing
  if (!(fullName || email)) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        email,
        fullName,
      },
    },
    {
      new: true, //from this the updated information is returned
    }
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(500, "internal server error");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { avatar: avatar.url },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Updated avatar successfully"));
});

// fucntion to get created forms

const updateUserSettings = asyncHandler(async (req, res) => {
  const { settings, fullName, bio } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const updateData = {};
  
  if (settings) {
    updateData.settings = settings;
  }
  
  if (fullName !== undefined) {
    updateData.fullName = fullName.trim();
  }
  
  if (bio !== undefined) {
    updateData.bio = bio.trim();
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Settings updated successfully"));
});

// Simple function to decode JWT payload (for development/testing)
const decodeGoogleJWT = (token) => {
  try {
    // Split the token
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    // Decode the payload (middle part)
    const payload = JSON.parse(
      Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
    );
    
    // Basic validation
    if (!payload.iss || !payload.aud || !payload.exp) {
      throw new Error('Invalid JWT payload');
    }
    
    // Check if token is expired
    if (payload.exp * 1000 < Date.now()) {
      throw new Error('Token expired');
    }
    
    // Check issuer
    if (payload.iss !== 'accounts.google.com' && payload.iss !== 'https://accounts.google.com') {
      throw new Error('Invalid issuer');
    }
    
    // Check audience (should be your Google Client ID)
    if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
      throw new Error('Invalid audience');
    }
    
    return payload;
  } catch (error) {
    throw new Error(`JWT verification failed: ${error.message}`);
  }
};

// Google OAuth functions
const googleAuth = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    throw new ApiError(400, "Google credential is required");
  }

  try {
    // Decode and verify the JWT credential
    const payload = decodeGoogleJWT(credential);
    
    const googleUser = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      email_verified: payload.email_verified,
    };

    // Check if user exists
    let user = await User.findOne({ 
      $or: [
        { email: googleUser.email },
        { googleId: googleUser.id }
      ]
    });

    if (user) {
      // Update existing user with Google info if not already set
      if (!user.googleId) {
        user.googleId = googleUser.id;
        user.authProvider = 'google';
        if (googleUser.picture && !user.avatar) {
          user.avatar = googleUser.picture;
        }
        await user.save({ validateBeforeSave: false });
      }
    } else {
      // Create new user
      user = await User.create({
        email: googleUser.email,
        fullName: googleUser.name || googleUser.email.split('@')[0],
        avatar: googleUser.picture || '',
        googleId: googleUser.id,
        authProvider: 'google',
      });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser,
            accessToken,
            refreshToken,
          },
          "Google authentication successful"
        )
      );
  } catch (error) {
    console.error("Google OAuth error:", error);
    throw new ApiError(400, `Google authentication failed: ${error.message}`);
  }
});

const getGoogleAuthUrl = asyncHandler(async (req, res) => {
  // Simple response for Google Auth URL - not needed for JWT implementation
  return res
    .status(200)
    .json(new ApiResponse(200, { authUrl: null }, "Use Google Identity Services directly"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserSettings,
  googleAuth,
  getGoogleAuthUrl,
};

// what not wotking are getchannelinfo  and updateaccountdeatils
