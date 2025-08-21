import express from "express";
const productRouter = express.Router();
import upload from "../middleware/multer.js";
import { auth } from "../middleware/userAuth.js";
import {
  upload_product,
  get_all_products,
  get_product_by_category_id,
  get_product_by_category_name,
  get_product_by_type_name,
  filter_product,
  get_single_product,
  delete_product,
  update_product,
  get_product_by_type_id,
  delete_multiple_product,
  get_latest_ten_product,
  filter_product_with_pagination,
  add_review,
  get_review,
  get_all_product_count,
} from "../controllers/Product_controller.js";
import adminAuth from "../middleware/adminAuth.js";

productRouter.post(
  "/upload_product",
  adminAuth,
  upload.array("product_image"),
  upload_product
);
productRouter.put(
  "/update_product/:id",
  adminAuth,
  upload.array("product_image"),
  update_product
);
productRouter.get("/get_all_product", get_all_products);
productRouter.get(
  "/get_product_by_category_id/:id",
  get_product_by_category_id
);
productRouter.get("/get_product_by_type_id/:id", get_product_by_type_id);
productRouter.get(
  "/get_product_by_category_name",
  get_product_by_category_name
);
productRouter.get("/get_product_by_type_name", get_product_by_type_name);
productRouter.get("/get_latest_ten_product", get_latest_ten_product);
productRouter.get("/filter_product", filter_product);
productRouter.post(
  "/filter_product_with_pagination",
  filter_product_with_pagination
);
productRouter.get("/get_single_product/:id", get_single_product);
productRouter.delete("/delete_product/:id", adminAuth, delete_product);
productRouter.delete(
  "/delete_multiple_product",
  adminAuth,
  delete_multiple_product
);

productRouter.post("/add_review", auth, upload.array("images"), add_review);
productRouter.get("/get_review/:id", get_review);
productRouter.get("/get_all_product_count", get_all_product_count);

export default productRouter;
