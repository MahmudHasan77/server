import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import validator from "validator";
import userModel from "../models/user_model.js";
import jwt from "jsonwebtoken";
import "dotenv/config";
import sendOTP from "../email_verification/verify_email.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utilities/token.js";

/* user register  */
const userRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name.trim()) {
      return res.json({
        success: false,
        message: "name is required !",
        error_type: "name",
      });
    }
    //name validation
    if (name.length < 3) {
      return res.json({
        success: false,
        message: "name length should be minimum 3 character",
        error_type: "name",
      });
    }

    if (!email) {
      return res.json({
        success: false,
        message: "email is required",
        error_type: "email",
      });
    }
    // email validation
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
        error_type: "email",
      });
    }

    if (!password) {
      return res.json({
        success: false,
        message: "password is required",
        error_type: "password",
      });
    }

    // password validation
    if (password.length < 5) {
      return res.json({
        success: false,
        message: "Password length should be equal or grater then 5",
        error_type: "password",
      });
    }

    // hashing password
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingEmail = await userModel.findOne({ email });

    if (existingEmail) {
      return res.json({ success: false, message: "user already existing" });
    } else {
      // OTP generator
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const newUser = await new userModel({
        name,
        email,
        password: hashedPassword,
        otp,
        otp_expires: new Date(Date.now() + 5 * 60 * 1000),
      });
      const saveUser = await newUser.save();

      //send verification email
      const verifyUserEmail = await sendOTP({
        to: email,
        subject: "verify email from e-commerce app",
        html: `
                    <div style="max-width:500px;margin:0 auto;padding:20px;font-family:Arial,sans-serif;border:1px solid #ddd;border-radius:8px;background-color:#f9f9f9;">
                      <h2 style="color:#333;text-align:center;">🔒 Email Verification</h2>
                      <p style="font-size:16px;color:#555;">
                        Hello,
                      </p>
                      <p style="font-size:16px;color:#555;">
                        Thank you for verifying your email. Please use the following OTP code to complete your verification:
                      </p>
                      <div style="text-align:center;margin:30px 0;">
                        <span style="display:inline-block;padding:15px 25px;font-size:24px;letter-spacing:8px;background-color:#ffffff;border:1px dashed #ccc;border-radius:4px;font-weight:bold;color:#222;">
                          ${otp}
                        </span>
                      </div>
                      <p style="font-size:14px;color:#777;">
                        This OTP is valid for 5 minutes. If you did not request this code, please ignore this email.
                      </p>
                      <p style="font-size:14px;color:#777;">
                        Regards,<br>
                        Your Company Team
                      </p>
   </div>`,
      });

      if (saveUser && verifyUserEmail.success) {
        return res.json({
          success: true,
          message: "Verify with OTP",
        });
      }
    }
  } catch (error) {
    console.log("user register error");
    res.json({ success: false, message: error.message });
  }
};

//register_with_google
const register_with_google = async (req, res) => {
  try {
    const { name, email } = req.body;
    const existingEmail = await userModel.findOne({ email });
    if (existingEmail) {
      const access_token = await generateAccessToken(existingEmail._id);
      const refresh_token = await generateRefreshToken(existingEmail._id);
      const loggedIn = await userModel.findByIdAndUpdate(
        existingEmail._id,
        {
          verify_email: true,
          last_login_date: new Date(),
          signUpWithGoogle: true,
        },
        { new: true }
      );

      res.cookie("access_token", access_token, {
        httpOnly: true,
        secure: true, // HTTPS  true
        sameSite: "None", //  frontend

        // maxAge: 24 * 60 * 60 * 1000, // (optional) 1
      });

      res.cookie("refresh_token", refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        // maxAge: 7 * 24 * 60 * 60 * 1000, // (optional)
      });

      res.json({
        success: true,
        token: access_token,
        user: loggedIn,
        message: "logeIn successfully",
      });
    } else {
      const newUser = await new userModel({
        name,
        email,
        signUpWithGoogle: true,
        password: "password",
      });

      const user = await newUser.save();
      const access_token = await generateAccessToken(user._id);
      const refresh_token = await generateRefreshToken(user._id);
      const loggedIn = await userModel.findByIdAndUpdate(
        user._id,
        {
          verify_email: true,
          last_login_date: new Date(),
        },
        { new: true }
      );
      res.cookie("access_token", access_token, {
        httpOnly: true,
        secure: true, // HTTPS  true
        sameSite: "None", //  frontend

        // maxAge: 24 * 60 * 60 * 1000, // (optional) 1
      });

      res.cookie("refresh_token", refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        // maxAge: 7 * 24 * 60 * 60 * 1000, // (optional)
      });

      res.json({
        success: true,
        token: access_token,
        user: loggedIn,
        message: "logeIn successfully",
      });
    }
  } catch (error) {
    console.log("user register error", error);
    res.json({ success: false, message: error.message });
  }
};
/* user register  */

/* verify_resend_otp  */
const verify_resend_otp = async (req, res) => {
  try {
    const { email } = req.body;

    const existingEmail = await userModel.findOne({ email });

    if (!existingEmail) {
      return res.json({ success: false, message: "Email not found" });
    }
    // OTP generator
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const update_user = await userModel.findByIdAndUpdate(existingEmail?._id, {
      verify_email: false,
      otp,
      otp_expires: new Date(Date.now() + 5 * 60 * 1000),
    });

    //send verification email
    const verifyUserEmail = await sendOTP({
      to: email,
      subject: "verify email from e-commerce app",
      html: `
                    <div style="max-width:500px;margin:0 auto;padding:20px;font-family:Arial,sans-serif;border:1px solid #ddd;border-radius:8px;background-color:#f9f9f9;">
                      <h2 style="color:#333;text-align:center;">🔒 Email Verification</h2>
                      <p style="font-size:16px;color:#555;">
                        Hello,
                      </p>
                      <p style="font-size:16px;color:#555;">
                        Thank you for verifying your email. Please use the following OTP code to complete your verification:
                      </p>
                      <div style="text-align:center;margin:30px 0;">
                        <span style="display:inline-block;padding:15px 25px;font-size:24px;letter-spacing:8px;background-color:#ffffff;border:1px dashed #ccc;border-radius:4px;font-weight:bold;color:#222;">
                          ${otp}
                        </span>
                      </div>
                      <p style="font-size:14px;color:#777;">
                        This OTP is valid for 5 minutes. If you did not request this code, please ignore this email.
                      </p>
                      <p style="font-size:14px;color:#777;">
                        Regards,<br>
                        Your Company Team
                      </p>
         </div>`,
    });

    if (update_user && verifyUserEmail.success) {
      return res.json({
        success: true,
        message: "check otp in your email",
      });
    }
  } catch (error) {
    console.log("user register error");
    res.json({ success: false, message: error.message });
  }
};
/* verify_resend_otp  */

/* user verify */
const user_verify = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "user not found " });
    }
    const isMatchOtp = user?.otp === otp;
    const isOtpNotExpired = user?.otp_expires > new Date();
    if (isMatchOtp && isOtpNotExpired) {
      user.verify_email = true;
      user.otp = null;
      user.otp_expires = null;
      await user.save();
      return res.json({ success: true, message: "user register successful" });
    }
    res.json({ success: false, message: "otp misMatch" });
  } catch (error) {
    res.json({ success: false, message: "something wrong try again" });
    console.log(error);
  }
};
/**user verify */

/** forgot password  */
const forgot_password = async (req, res) => {
  try {
    const { email } = req.body;
    const existingEmail = await userModel.findOne({ email });
    if (!existingEmail) {
      return res.json({ success: false, message: "email not found" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const updatedUser = await userModel.findByIdAndUpdate(existingEmail?._id, {
      otp,
      otp_expires: new Date(Date.now() + 5 * 60 * 1000),
      verify_email: false,
    });
    const verifyUserEmail = await sendOTP({
      to: email,
      subject: "verify email from e-commerce app",
      html: `
                  <div style="max-width:500px;margin:0 auto;padding:20px;font-family:Arial,sans-serif;border:1px solid #ddd;border-radius:8px;background-color:#f9f9f9;">
                    <h2 style="color:#333;text-align:center;">🔒 Email Verification</h2>
                    <p style="font-size:16px;color:#555;">
                      Hello,
                    </p>
                    <p style="font-size:16px;color:#555;">
                      Thank you for verifying your email. Please use the following OTP code to complete your verification:
                    </p>
                    <div style="text-align:center;margin:30px 0;">
                      <span style="display:inline-block;padding:15px 25px;font-size:24px;letter-spacing:8px;background-color:#ffffff;border:1px dashed #ccc;border-radius:4px;font-weight:bold;color:#222;">
                        ${otp}
                      </span>
                    </div>
                    <p style="font-size:14px;color:#777;">
                      This OTP is valid for 5 minutes. If you did not request this code, please ignore this email.
                    </p>
                    <p style="font-size:14px;color:#777;">
                      Regards,<br>
                      Your Company Team
                    </p>
             </div>`,
    });
    if (updatedUser && verifyUserEmail.success) {
      return res.json({
        success: true,
        message: "Verify with OTP",
      });
    }
  } catch (error) {
    res.json({ success: false, message: "something wrong tray again" });
  }
};
/** forgot password  */
/**verify forgot password  */
const verify_forgot_password = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!otp) {
      return res.json({ success: false, message: "Send OTP" });
    }
    const existing_user = await userModel.findOne({ email });
    if (!existing_user) {
      return res.json({ success: false, message: "user not found" });
    }

    const isMatchOtp = existing_user?.otp == otp;

    const isMatchOtpExpires = existing_user?.otp > Date.now();

    if (!isMatchOtp) {
      return res.json({ success: false, message: "otp MisMatch " });
    }
    if (isMatchOtpExpires) {
      return res.json({ success: false, message: "otp time out" });
    }

    const verified_user = await userModel.findByIdAndUpdate(
      existing_user._id,
      {
        verify_email: true,
        otp: null,
        otp_expires: null,
        last_login_date: new Date(),
      },
      { new: true }
    );

    const access_token = await generateAccessToken(existing_user?._id);
    const refresh_token = await generateRefreshToken(existing_user?._id);
    res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: true, // HTTPS  true
      sameSite: "None", //  frontend

      // maxAge: 24 * 60 * 60 * 1000, // (optional) 1
    });

    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      // maxAge: 7 * 24 * 60 * 60 * 1000, // (optional)
    });
    res.json({
      success: true,
      message: "user register successfully",
      token: access_token,
      user: verified_user,
    });
  } catch (error) {
    res.json({ success: false, message: "something wrong tray again" });
    console.log(error);
  }
};
/**verify forgot password  */

/* user login  */
const userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email) {
      return res.json({ success: false, message: "enter an email" });
    }
    if (!password) {
      return res.json({ success: false, message: "enter password" });
    }
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "user not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.json({ success: false, message: "password misMatch" });
    }
    if (!user.verify_email) {
      return res.json({
        success: false,
        message: "your email is not verified yet",
      });
    }
    const access_token = await generateAccessToken(user._id);
    const refresh_token = await generateRefreshToken(user._id);
    const loggedIn = await userModel.findByIdAndUpdate(
      user._id,
      {
        last_login_date: new Date(),
      },
      { new: true }
    );
    res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: true, // HTTPS  true
      sameSite: "None", //  frontend

      // maxAge: 24 * 60 * 60 * 1000, // (optional) 1
    });

    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      // maxAge: 7 * 24 * 60 * 60 * 1000, // (optional)
    });
    res.json({
      success: true,
      token: access_token,
      user: loggedIn,
      message: "logeIn successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "login failed" });
  }
};
/* user login  */

/**reset_password */
const reset_password = async (req, res) => {
  try {
    const { new_password, confirm_password } = req.body.userInfo;
    const id = req.user_id;
    const existinguser = await userModel.findById(id);
    if (!existinguser) {
      return res.json({ success: false, message: "user not found " });
    }
    if (!new_password || !confirm_password) {
      return res.json({ success: false, message: "password is required" });
    }

    if (new_password !== confirm_password) {
      return res.json({ success: false, message: "password misMatch" });
    }
    // password validation

    if (new_password.length < 5) {
      return res.json({
        success: false,
        message: "Password length should be equal or grater then 5",
      });
    }
    if (confirm_password.length < 5) {
      return res.json({
        success: false,
        message: "Password length should be equal or greater then 5",
      });
    }

    const hashedPassword = await bcrypt.hash(confirm_password, 10);

    const updated_password = await userModel.findByIdAndUpdate(
      existinguser?._id,
      {
        password: hashedPassword,
      },
      { new: true }
    );
    if (updated_password) {
      return res.json({
        success: true,
        message: "password updated successfully",
      });
    }
  } catch (error) {
    res.json({ success: false, message: "something wrong try again" });
    console.log(error);
  }
};
/**reset_password */
/**refresh_token */
const refresh_token = async (req, res) => {
  try {
    const refresh_token = req.cookies.refresh_token;
    if (!refresh_token) {
      return res.json({ success: false, message: "token not found" });
    }

    const verify_token = await jwt.verify(
      refresh_token,
      process.env.JWT_SECRET
    );
    if (!verify_token) {
      return res.json({ success: false, message: "token is expired" });
    }
    const id = verify_token._id;
    const new_access_token = await generateAccessToken(id);
    res.cookie("access_token", new_access_token, {
      httpOnly: true,
      secure: true, // HTTPS  true
      sameSite: "None", //  frontend

      // maxAge: 24 * 60 * 60 * 1000, // (optional) 1
    });

    res.json({ success: true, message: "token updated successfully" });
  } catch (error) {
    res.json({ success: false, message: "something wrong try again" });
  }
};
/**refresh_token */

/**user Avatar**/
const user_profile_image = async (req, res) => {
  try {
    const user_id = req.user_id;
    const image = req.files[0];

    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    };
    let image_url = "";
    const result = await cloudinary.uploader.upload(image.path, options);
    image_url = result.secure_url;

    const user = await userModel.findById(user_id);
    if (!user.verify_email) {
      return res.json({ success: false, message: "email is not verified yet" });
    }

    const profile_image = user?.profile_image ? user?.profile_image : "";

    if (profile_image) {
      const urlArr = profile_image.split("/");
      const imag = urlArr[urlArr.length - 1].split(".")[0];
      await cloudinary.uploader.destroy(imag);
    }

    const saved_user = await userModel.findByIdAndUpdate(
      user_id,
      { profile_image: image_url },
      { new: true }
    );

    saved_user
      ? res.json({
          success: true,
          message: "Profile image Added successfully",
          data: saved_user,
        })
      : res.json({ success: false, message: "Profile image not added" });
  } catch (error) {
    res.json({ success: false, message: "something wrong tray again" });
    console.log(error);
  }
};
/**user Avatar**/

/**personal_details */
const personal_details = async (req, res) => {
  try {
    const id = req.user_id;
    const existing_user = await userModel
      .findById(id)
      .populate("address_details")
      .populate("shopping_cart")
      .populate("order_history");

    if (!existing_user) {
      return res.json({ success: false, message: "user not found" });
    }
    res.json({ success: true, data: existing_user });
  } catch (error) {
    res.json({ success: false, message: "something wrong " });
    console.log(error);
  }
};
/**personal_details */
/* user logout */
const userLogOut = async (req, res) => {
  try {
    const cookieOption = { httpOnly: true, secure: true, sameSite: "none" };
    await userModel.findByIdAndUpdate(req.user_id, { refresh_token: "" });
    res.clearCookie("access_token"),
      cookieOption,
      res.clearCookie("refresh_token"),
      cookieOption;
    res.status(201).json({ success: true, message: "logout successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "something wrong try again" });
  }
};
/** user logout */

/* admin login */
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    // checking email password
    if (!email) {
      return res.json({ success: false, message: "Enter an email" });
    }
    if (!password) {
      return res.json({ success: false, message: "Enter password" });
    }

    const user = await userModel.findOne({ email });

    if (!user?.isAdmin) {
      return res.json({ success: false, message: " unauthorized admin" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch && user.isAdmin) {
      const adminToken = jwt.sign(
        { email: user.email },
        process.env.JWT_SECRET
      );
      return res.json({
        success: true,
        message: "loggedIn successfully",
        adminToken,
      });
    } else {
      return res.json({ success: false, message: "password wrong" });
    }
  } catch (error) {
    await res.json({ success: false, message: "something wrong try again" });
  }
};
/* admin login */

/* remove user */
const removeUser = async (req, res) => {
  try {
    const id = req.body;
    const user = await userModel.findById(id);
    if (user.isAdmin) {
      return res.json({ success: false, message: "Admin will be not deleted" });
    }

    const deletedUser = await userModel.findByIdAndDelete(id);
    if (deletedUser) {
      return res.json({ success: true, message: "deleted successfully" });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
/* delete multiple users */
const deleteMultipleUser = async (req, res) => {
  try {
    const users = await userModel.find({ _id: { $in: req.body.usersIds } });
    for (const user of users) {
      if (user?.profile_image) {
        const urlArr = user?.profile_image?.split("/");
        const publicUrl = urlArr[urlArr.length - 1].split(".")[0];
        await cloudinary.uploader.destroy(publicUrl);
      }
    }
    const deletedUsers = await userModel.deleteMany({ _id: req.body.usersIds });
    // if (user.isAdmin) {
    //   return res.json({ success: false, message: "Admin will be not deleted" });
    // }

    if (!deletedUsers.acknowledged) {
      return res
        .status(500)
        .json({ success: false, message: "Something went wrong" });
    }
    res
      .status(201)
      .json({ success: true, message: "Users deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
/** remove user */

/* update user */
const updateUser = async (req, res) => {
  try {
    const { name, email, OldPassword, ConfirmPassword, mobile } = req.body;

    const existinguser = await userModel.findById(req.user_id);

    if (!existinguser) {
      return res.json({ success: false, message: "user not found" });
    }
    if (!existinguser?.verify_email) {
      return res.json({ success: false, message: "email is not verified yet" });
    }
    let otp = "";

    if (email && existinguser.email !== email) {
      otp = Math.floor(100000 + Math.random() * 900000).toString();
    }

    if (!existinguser?.signUpWithGoogle) {
      if (!OldPassword) {
        return res.json({
          success: false,
          message: "Please provide old password",
        });
      }
      
      if (!ConfirmPassword) {
        return res.json({
          success: false,
          message: "Please provide old password before setting a new one.",
        });
      }
    
    
        if (OldPassword) {
          const is_match_old_password = await bcrypt.compare(
            OldPassword,
            existinguser.password
          );
          if (!is_match_old_password) {
            return res.json({
              success: false,
              message: " Old password mis match",
            });
          }
        } 
    
    
    }
 
    let newPassword = "";


      if (!ConfirmPassword) {
        return res.json({
          success: false,
          message: "Please provide New password.",
        });
      }
    


 if (ConfirmPassword) {
      newPassword = await bcrypt.hash(ConfirmPassword, 10);
    } 

    const updatedUser = await userModel.findByIdAndUpdate(
      req.user_id,
      {
        name: name,
        email: email,
        signUpWithGoogle: false,
        mobile,
        verify_email:
          email && email === existinguser.email ? true : email ? false : true,
        password: newPassword,
        otp: otp === "" ? null : otp,
        otp_expires: otp === "" ? "" : new Date(Date.now() + 5 * 60 * 1000),
      },
      { new: true }
    );
    if (email && existinguser.email !== email) {
      const verifyUserEmail = await sendOTP({
        to: email,
        subject: "verify email from e-commerce app",
        html: `
                    <div style="max-width:500px;margin:0 auto;padding:20px;font-family:Arial,sans-serif;border:1px solid #ddd;border-radius:8px;background-color:#f9f9f9;">
                      <h2 style="color:#333;text-align:center;">🔒 Email Verification</h2>
                      <p style="font-size:16px;color:#555;">
                        Hello,
                      </p>
                      <p style="font-size:16px;color:#555;">
                        Thank you for verifying your email. Please use the following OTP code to complete your verification:
                      </p>
                      <div style="text-align:center;margin:30px 0;">
                        <span style="display:inline-block;padding:15px 25px;font-size:24px;letter-spacing:8px;background-color:#ffffff;border:1px dashed #ccc;border-radius:4px;font-weight:bold;color:#222;">
                          ${otp}
                        </span>
                      </div>
                      <p style="font-size:14px;color:#777;">
                        This OTP is valid for 5 minutes. If you did not request this code, please ignore this email.
                      </p>
                      <p style="font-size:14px;color:#777;">
                        Regards,<br>
                        Your Company Team
                      </p>
         </div>`,
      });

      console.log(verifyUserEmail);
      if (verifyUserEmail.success) {
        return res.json({
          success: true,
          message: "check otp in your email",
        });
      } else {
        return res.json({
          success: false,
          message: "something wrong tray again from send otp",
        });
      }
    }

    if (updatedUser) {
      return res.json({
        success: true,
        message: "user updated successfully",
        data: updatedUser,
      });
    } else {
      return res.json({
        success: false,
        message: "something wrong try again ",
      });
    }
  } catch (error) {
    res.json({ success: false, message: "something wrong " });
  }
};
/** update user */

/* getAllUser **/
const getUser = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const search = req.query.search;
    const skip = (page - 1) * limit;
    let searchValue = {};

    if (search) {
      searchValue = { name: { $regex: search, $options: "i" } };
    }
    const total = await userModel.countDocuments(searchValue);
    const users = await userModel.find(searchValue).skip(skip).limit(limit);
    if (users) {
      return res.json({
        success: true,
        message: "found all user",
        total,
        pagination: { page, totalPage: Math.ceil(total / limit) },
        users,
      });
    }
    res.json({ success: false, message: "user not found , try again" });
  } catch (error) {
    res.json({ success: false, message: "something wrong" });
    console.log(error.message);
  }
};
/** getAllUser **/

/* home controller */
const homeController = (req, res) => {
  res.send("Welcome to home page");
};
/** home controller */

export {
  userRegister,
  user_verify,
  userLogin,
  user_profile_image,
  adminLogin,
  removeUser,
  updateUser,
  getUser,
  homeController,
  userLogOut,
  forgot_password,
  verify_forgot_password,
  reset_password,
  refresh_token,
  personal_details,
  verify_resend_otp,
  register_with_google,
  deleteMultipleUser,
};
