import jwt from "jsonwebtoken";
import userModel from "../models/user_model.js";

const generateAccessToken = async (id) => {
  const access_token = await jwt.sign(
    {
      _id: id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "10d" }
  );

  return access_token;
};
const generateRefreshToken = async (id) => {
  const refresh_token = await jwt.sign({ _id: id }, process.env.JWT_SECRET, {
    expiresIn: "10d",
  });
  await userModel.findByIdAndUpdate(id, { refresh_token: refresh_token });
  return refresh_token;
};

export { generateAccessToken, generateRefreshToken };
