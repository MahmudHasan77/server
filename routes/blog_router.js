import express from "express";
import { auth } from "../middleware/userAuth.js";
import upload from "./../middleware/multer.js";
import {
  add_blog,
  get_blog,
  delete_blog,
  update_blog,
} from "../controllers/blog_controller.js";
import adminAuth from "../middleware/adminAuth.js";

const blog_router = express.Router();

blog_router.post("/add", adminAuth, upload.array("blog_image"), add_blog);
blog_router.put(
  "/update_blog/:id",
  adminAuth,
  upload.array("blog_image"),
  update_blog
);
blog_router.get("/get_blog", get_blog);
blog_router.delete("/delete_blog/:id", adminAuth, delete_blog);

export default blog_router;
