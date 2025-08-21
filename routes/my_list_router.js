import express from "express";
import { auth } from "../middleware/userAuth.js";
import {
  add_to_my_list,
  delete_my_list,
  get_my_list,
} from "../controllers/my_list_controller.js";

const my_list_router = express.Router();

my_list_router.post("/add_to_my_list", auth, add_to_my_list);
my_list_router.get("/get_my_list/:id", auth, get_my_list);
my_list_router.delete("/delete_my_list/:id", auth, delete_my_list);

export default my_list_router;
