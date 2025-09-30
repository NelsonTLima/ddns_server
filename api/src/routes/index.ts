import { Router } from "express";
import { authenticate } from "#middleware/authentication.js";
import handle from '#handlers';
import validate from '#middleware/validate.js';
import normalize from '#middleware/normalize.js';

const router = Router();

// POST /api/auth/login
router.post(
  "/auth/login",
  validate.login,
  handle.login
);

// POST /api/auth/newtoken
router.post(
  "/auth/newtoken",
  authenticate,
  handle.newToken
);

// POST /api/auth/logout
router.post(
  "/auth/logout",
  handle.logout
);

// POST /api/auth/keepSession
router.get(
  "/auth/keepSession",
  handle.keepSession
);

// GET /api/panel
router.get('/panel',
  authenticate,
  handle.getPanel
);

// GET /api/ddns/jobs/stream?jobId=...
router.get("/ddns/jobs/stream", handle.stream);

// POST /api/ddns/add
router.post("/ddns/add",
  normalize.post,
  validate.post,
  authenticate,
  handle.post,
);

// POST /api/ddns/remove
router.post("/ddns/remove",
  authenticate,
  handle.remove
);

// POST /api/ddns/update
router.post("/ddns/update",
  authenticate,
  handle.update
);

// POST /api/ddns/sync
router.post("/ddns/sync",
  validate.sync,
  authenticate,
  normalize.sync,
  handle.sync
);

// GET /test
export default router;
