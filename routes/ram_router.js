import express from 'express'
import { add_ram, getRam, deleteRam } from "../controllers/ram_controller.js";
import { auth } from "../middleware/userAuth.js";
import adminAuth from '../middleware/adminAuth.js';

const ram_router = express.Router()

ram_router.post("/add_ram", adminAuth, add_ram);
ram_router.get("/getRam", getRam);
ram_router.delete("/deleteRam/:id", adminAuth, deleteRam);

export default ram_router