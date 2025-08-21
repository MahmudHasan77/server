import jwt from "jsonwebtoken";
import userModel from "./../models/user_model.js";

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      req.cookies.access_token ||
      (authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null);

    if (!token) {
      return res.status(401).json({ success: false, message: "Provide token" });
    }

    const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user_id = decodeToken._id;
    const user = await userModel.findById(decodeToken?._id);
    if (!user?.verify_email) {
      return res
        .status(404)
        .json({ success: false, message: "Your Email is not verified yet" });
    }
    next();
  } catch (error) {
    console.log("JWT Error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token." });
    }

    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export { auth };
