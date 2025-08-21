import  express  from 'express';
import { auth } from '../middleware/userAuth.js';
import {
  add_to_cart,
  cart_info,
  update_cart_info,
  delete_cart,
  reset_cart,
} from "../controllers/cart_controller.js";

const cart_router = express.Router()

cart_router.post("/add_to_cart", auth, add_to_cart);
cart_router.get("/get_cart", auth, cart_info);
cart_router.post("/update_quantity/:id", auth, update_cart_info);
cart_router.post("/delete_cart/:id", auth, delete_cart);
cart_router.delete("/reset_cart", auth, reset_cart);

export default cart_router