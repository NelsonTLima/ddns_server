import { Router } from "express";
import authRoutes from "./auth/index.js";
import ddnsRoutes from "./ddns/index.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/ddns", ddnsRoutes);

export default router;
