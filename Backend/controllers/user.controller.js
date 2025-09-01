import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";

// Helper function for consistent cookie options
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 24 * 60 * 60 * 1000, // 1 day
  path: '/', // Ensure path is consistent
});

// Helper function for clearing cookies (without maxAge)
const getClearCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/', // Ensure path matches
});

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

  // Generate tokens and set cookies for auto-login after registration
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
  const options = getCookieOptions();

  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, {
      user: createdUser,
      accessToken,
      refreshToken,
    }, "User registered and logged in successfully"));
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

  const options = getCookieOptions();

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

  const options = getClearCookieOptions();

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out successfully"));
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

    const options = getCookieOptions();

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

  try {
    const updateData = {};
    
    // Handle settings updates with proper nesting
    if (settings) {
      // Handle theme setting
      if (settings.theme) {
        updateData['settings.theme'] = settings.theme;
      }
      
      // Handle notification settings
      if (settings.notifications) {
        Object.keys(settings.notifications).forEach(key => {
          updateData[`settings.notifications.${key}`] = settings.notifications[key];
        });
      }
      
      // Handle privacy settings
      if (settings.privacy) {
        Object.keys(settings.privacy).forEach(key => {
          updateData[`settings.privacy.${key}`] = settings.privacy[key];
        });
      }
    }
    
    if (fullName !== undefined) {
      updateData.fullName = fullName.trim();
    }
    
    if (bio !== undefined) {
      updateData.bio = bio.trim();
    }

    console.log('Updating user settings with data:', updateData);

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    console.log('Settings updated successfully for user:', user.email);

    return res
      .status(200)
      .json(new ApiResponse(200, { user }, "Settings updated successfully"));
      
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw new ApiError(500, `Failed to update settings: ${error.message}`);
  }
});

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Verify Google JWT token
const verifyGoogleToken = async (token) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    
    // Verify the token is valid
    if (!payload) {
      throw new Error('Invalid token payload');
    }
    
    return payload;
  } catch (error) {
    throw new Error(`Google token verification failed: ${error.message}`);
  }
};

// Google OAuth functions
const googleAuth = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    throw new ApiError(400, "Google credential is required");
  }

  try {
    // Verify the Google JWT token properly
    const payload = await verifyGoogleToken(credential);
    
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

    const options = getCookieOptions();

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

// ========================================
// SECURE SERVER-SIDE OAUTH FLOW
// ========================================

// Initialize Google OAuth2 client
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.BACKEND_URL || 'http://localhost:9000'}/api/v1/user/auth/google/callback`
);

// Step 1: Initiate Google OAuth (redirect user to Google)
const initiateGoogleAuth = asyncHandler(async (req, res) => {
  // Generate state parameter for CSRF protection
  const state = crypto.randomBytes(32).toString('hex');
  
  // For simplicity, we'll store state in a signed cookie instead of session
  // In production, consider using Redis or database for better scalability
  res.cookie('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000, // 10 minutes
    signed: true
  });
  
  // Generate the authorization URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    state: state,
    prompt: 'consent'
  });

  console.log('🔗 Redirecting to Google OAuth URL');
  
  // Redirect user to Google
  res.redirect(authUrl);
});

// Step 2: Handle Google OAuth callback
const handleGoogleCallback = asyncHandler(async (req, res) => {
  const { code, state, error } = req.query;
  
  // Check for OAuth errors
  if (error) {
    console.error('❌ Google OAuth error:', error);
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_error`);
  }
  
  // Verify state parameter for CSRF protection
  const storedState = req.signedCookies.oauth_state;
  if (!state || state !== storedState) {
    console.error('❌ Invalid state parameter');
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=invalid_state`);
  }
  
  // Clear the state cookie
  res.clearCookie('oauth_state');
  
  try {
    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    // Get user info from Google
    const userInfoResponse = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`
    );
    const googleUser = await userInfoResponse.json();
    
    if (!googleUser.email) {
      throw new Error('Unable to get user email from Google');
    }
    
    console.log('✅ Google user data received:', { email: googleUser.email, name: googleUser.name });
    
    // Check if user exists in database
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

    // Generate JWT tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    // Set secure cookies
    const cookieOptions = getCookieOptions();

    res.cookie('accessToken', accessToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, cookieOptions);

    console.log('✅ User authenticated successfully, redirecting to frontend');
    
    // Redirect to frontend with success
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/?auth=success`);
    
  } catch (error) {
    console.error('❌ Google OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
  }
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
  initiateGoogleAuth,
  handleGoogleCallback,
};

// what not wotking are getchannelinfo  and updateaccountdeatils
