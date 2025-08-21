import express from "express";
import {
  adminLogin,
  getUser,
  removeUser,
  updateUser,
  userLogin,
  userRegister,
  user_verify,
  userLogOut,
  user_profile_image,
  forgot_password,
  verify_forgot_password,
  reset_password,
  refresh_token,
  personal_details,
  verify_resend_otp,
  register_with_google,
  deleteMultipleUser,
} from "../controllers/user_controller.js";
import { auth } from "../middleware/userAuth.js";
import upload from "../middleware/multer.js";

const userRouter = express.Router();

userRouter.post("/register", userRegister);
userRouter.post("/register_with_google", register_with_google);
userRouter.post("/verify", user_verify);
userRouter.post("/verify_resend_otp", verify_resend_otp);
userRouter.post("/login", userLogin);
userRouter.post("/forgot_password", forgot_password);
userRouter.post("/verify_forgot_password", verify_forgot_password);
userRouter.post("/reset_password", auth, reset_password);
userRouter.post("/refresh_token", auth, refresh_token);
userRouter.post("/user_profile_image",auth,upload.array("profile_image"),user_profile_image);
userRouter.post("/logOut", auth, userLogOut);
userRouter.post("/adminLogin", adminLogin);
userRouter.post("/remove", removeUser);
userRouter.post("/deleteMultipleUser", auth, deleteMultipleUser);
userRouter.post("/update", auth, updateUser);
userRouter.get("/personal_details", auth, personal_details);
userRouter.get("/users", auth, getUser);

export default userRouter;
