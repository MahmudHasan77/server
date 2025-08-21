import express from "express";
import { auth } from "../middleware/userAuth.js";
import {
  add_slider,
  get_home_slider,
  delete_slider,
  add_second_slider,
  get_second_slider,
  delete_second_slider,
} from "../controllers/slider_controller.js";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";
const slider_router = express.Router();

slider_router.post("/add_slider", adminAuth, upload.array("image"), add_slider);
slider_router.post(
  "/add_second_slider",
  adminAuth,
  upload.array("image"),
  add_second_slider
);

slider_router.get("/get_home_slider", get_home_slider);
slider_router.get("/get_second_slider", get_second_slider);
slider_router.delete("/delete_slider/:id", adminAuth, delete_slider);
slider_router.delete(
  "/delete_second_slider/:id",
  adminAuth,
  delete_second_slider
);
export default slider_router;
