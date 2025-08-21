import express from "express";
import { auth } from "../middleware/userAuth.js";
import upload from "../middleware/multer.js";
import {
  create_category,
  get_categories,
  count_category,
  get_type,
  get_category_by_id,
  delete_category,
  update_category,
} from "../controllers/category_controller.js";
import adminAuth from "../middleware/adminAuth.js";
const category_router = express.Router();

category_router.post(
  "/create_category",
  adminAuth,
  upload.array("category_image"),
  create_category
);

category_router.get("/get_categories", get_categories);
category_router.get("/count_category", count_category);
category_router.get("/get_type", get_type);
category_router.get("/get_category_by_id/:id", get_category_by_id);
category_router.delete("/delete_category/:id", adminAuth, delete_category);
category_router.put(
  "/update_category/:id",
  adminAuth,
  upload.array("category_image"),
  update_category
);

export default category_router;
