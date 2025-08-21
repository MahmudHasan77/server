import express from 'express'
import { auth } from '../middleware/userAuth.js'
import {
  change_status,
  create_order, 
  get_all_orders,
  get_orders,
  get_ten_orders,
  get_all_order_count,
  getDeliveredSales,
} from "../controllers/order_controller.js";
const order_router = express.Router()

order_router.post("/create_order", auth, create_order);
order_router.get('/get_orders',auth,get_orders)
order_router.post("/change_status/:id", auth, change_status);
order_router.get("/get_ten_orders", auth, get_ten_orders);
order_router.get("/get_all_orders", auth, get_all_orders);
order_router.get("/get_all_order_count", auth, get_all_order_count);
order_router.get("/getDeliveredSales", auth, getDeliveredSales);

export default order_router