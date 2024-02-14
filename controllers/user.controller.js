// import { JsonWebTokenError } from "jsonwebtoken";
import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";
import sendEmail from "../utils/sendEmail.js";
// import { appendFile } from "fs";
import crypto from "crypto";
const cookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000, //7days
  httpOnly: true,
  secure: true,
};

const register = async (req, res, next) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password)
    return next(new AppError("All fields are required", 400));

  const userExist = await User.findOne({ email });
  if (userExist) return next(new AppError("Email already exists ", 400));

  const user = await User.create({
    fullName,
    email,
    password,
    avatar: {
      public_id: email,
      secure_url:
        "https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  });

  if (!user)
    return next(
      new AppError("User Registration Failed, Please try again !", 400)
    );

  if (req.file) {
    console.log("File Details", JSON.stringify(req.file));
    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms",
        width: 250,
        height: 250,
        gravity: "faces",
        crop: "fill",
      });

      if (result) {
        user.avatar.public_id = result.public_id;
        user.avatar.secure_url = result.secure_url;

        // Remove file from local server
        fs.rm(`uploads/${req.file.filename}`);
      }
    } catch (error) {
      return next(
        new AppError(error || "File Not uploaded, Please try again Later!", 500)
      );
    }
  }

  await user.save();
  user.password = undefined;

  const token = await user.generateJWTToken();
  res.cookie("token", token, cookieOptions);

  res.status(200).json({
    success: true,
    message: "User Registered Sucessfully ",
    user,
  });
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return next(new AppError("All fields are required", 400));

    const user = await User.findOne({ email }).select("+password");
    if (!user || !user.comparePassword(password)) {
      return next(new AppError("Email or Password doesn't match", 400));
    }
    const token = user.generateJWTToken();
    user.password = undefined;

    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      success: true,
      message: "User loggedin Successfully",
      user,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const logout = (req, res) => {
  res.cookie(token, null, {
    secure: true,
    maxAge: 0,
    httpOnly: true,
  });
  res.send(200).json({
    success: true,
    message: "User LoggedOut successfully",
  });
};

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    res.status(200).json({
      success: true,
      message: "User details",
      user,
    });
  } catch (error) {
    return next(new AppError("Failed to fetch Profile details", 500));
  }
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new AppError("Email is Required", 400));

  const user = await User.findOne({ email });

  if (!user) return next(new AppError("Email is not Registered", 400));
  const resetToken = await user.generatePasswordResetToken();
  await user.save();

  const resetPasswordURL = `${process.env.FRONTEND_URL}/reset/${resetToken}`;
  console.log(resetPasswordURL);
  try {
    const subject = "Reset Password";
    const messsage = `You can reset Password by clicking <a href=${resetPasswordURL}`;
    await sendEmail(email, subject, messsage);

    res.status(200).json({
      success: true,
      message: `Reset password token has been sent to ${email} successfully`,
    });
  } catch (error) {
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;
    await user.save();

    return next(new AppError(error.message, 400));
  }
};

const resetPassword = async (req, res, next) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  const forgotPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    forgotPasswordToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new AppError("Token is Invalid or Expired, Please try again !", 400)
    );
  }

  user.password = password;

  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  user.save();

  res.status(200).json({
    success: true,
    message: "Your Password Saved Successfully",
  });
};

const changePassword = async (req, res, next) => {
  const {oldPassword, newPassword} = req.body;
  const {id} = req.user;
  if(!oldPassword || !newPassword){
    return next (new AppError('All fields are Mandatory', 400)
 ) }

  const user = await user.findById(id).select('+password');
  if(!user){
    return next (new AppError('User Does not exist', 400)
  )}

  const isPassword = await user.comparePassword(oldPassword);
  if(!isPassword){
    return next ( new AppError('Invalid Old password', 400));
  }

  user.password = newPassword;
  await user.save();
  user.password = undefined;

  res.status(200).json({
    success : true,
    message: "Password Changed Successfully"
  })


}

const updateUser = async (req, res, next ) => {
  const{fullName} = req.body;
  const {id} = req.user.id;

  const user = await user.findById(id);
  if(!user){
    return next(new AppError('User Does not Exist ',400));

  }

  if(req.fullName){
    user.fullName = fullName;
  }

  if(req.file){
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms",
        width: 250,
        height: 250,
        gravity: "faces",
        crop: "fill",
      });

      if (result) {
        user.avatar.public_id = result.public_id;
        user.avatar.secure_url = result.secure_url;

        // Remove file from local server
        fs.rm(`uploads/${req.file.filename}`);
      }
    } catch (error) {
      return next(
        new AppError(error || "File Not uploaded, Please try again Later!", 500)
      );
    }

  }
  await user.save();
  res.status(200).json({
    success:true,
    message:'User details updated sucessfully!'
  })
}
export { register, login, logout, getProfile, forgotPassword, resetPassword ,changePassword, updateUser};
