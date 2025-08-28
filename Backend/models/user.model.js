import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    fullName: {
      type: String,
      required: [true, "Full Name is required"],
      lowercase: true,
      trim: true,
    },
    avatar: {
      type: String, //cloudinary url
      // required: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
    createdForms: [
      {
        type: Schema.Types.ObjectId,
        ref: "Form",
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  console.log(password, this.password);
  return await bcrypt.compare(password, this.password);
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this.id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this.id,
      userName: this.userName,
      fullName: this.fullName,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
