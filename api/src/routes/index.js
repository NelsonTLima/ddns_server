import { Router } from "express";
import apiRoutes from "./api/index.js";
import pageRoutes from "./pages/index.js";

const router = Router();

router.use("/", apiRoutes);
router.use("/", pageRoutes);

export default router;
