import express from "express";
import validate from "#middleware/validate.js";
import { authenticate } from "#middleware/authentication.js";
import handle from "./handlers.js";

const router = express.Router();

// POST /api/auth/login
router.post(
  "/login",
  validate.login,
  handle.login
);

// POST /api/auth/newtoken
router.post(
  "/newtoken",
  authenticate,
  handle.newToken
);

// POST /api/auth/logout
router.post(
  "/logout",
  handle.logout
);

// POST /api/auth/keepSession
router.get(
  "/keepSession",
  handle.keepSession
);

export default router;
