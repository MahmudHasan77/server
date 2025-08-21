import  express  from 'express';
import { auth } from '../middleware/userAuth.js';
import {
  add_address_controller,
  get_all_address,
  select_address,
  delete_address,
} from "../controllers/address_controller.js";

const address_router = express.Router()

address_router.post('/add',auth,add_address_controller)
address_router.post("/select_address/:address_id", auth, select_address);
address_router.get("/get_all_address", auth, get_all_address);
address_router.delete("/delete_address/:id", auth, delete_address);

export default address_router;