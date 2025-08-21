import express, { urlencoded } from "express";
import "dotenv/config";
import cors from "cors";
import userRouter from "./routes/userRouter.js";
import cookieParser from "cookie-parser";

import { homeController } from "./controllers/user_controller.js";
import productRouter from "./routes/product_router.js";
import category_router from "./routes/category_router.js";
import cart_router from "./routes/cart_router.js";
import my_list_router from "./routes/my_list_router.js";
import address_router from "./routes/address_router.js";
import ram_router from "./routes/ram_router.js";
import slider_router from "./routes/slider_router.js";
import blog_router from "./routes/blog_router.js";
import order_router from "./routes/order_router.js";
const app = express();
app.use(cookieParser());

app.use(urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/blog", blog_router);
app.use("/api/category", category_router);
app.use("/api/cart", cart_router);
app.use("/api", my_list_router);
app.use("/api/address", address_router);
app.use("/api/order", order_router);
app.use("/api/ram", ram_router);
app.use("/api/slider", slider_router);
app.get("/", homeController);
app.use((req, res, error) => {
  try {
    res.send("page not found");
  } catch (error) {
    res.send(error.massage);
  }
});

export default app;
