import express from "express";
import { getPanel } from "./controller.js";
import { authenticate } from "#middleware/authentication.js";

const router = express.Router();

router.get("/panel", authenticate, getPanel);

export default router;
