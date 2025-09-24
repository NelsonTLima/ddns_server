import express from "express";
import handle from "./handlers.js";
import validate from "#middleware/validate.js";
import { authenticate } from "#middleware/authentication.js";
import normalize from "#middleware/normalize.js";

const router = express.Router();

// GET /api/ddns/jobs/stream?jobId=...
router.get("/jobs/stream", handle.jobStream);

// POST /api/ddns/add
router.post("/add",
  normalize.post,
  validate.post,
  authenticate,
  handle.post,
);

// POST /api/ddns/remove
router.post("/remove",
  authenticate,
  handle.remove
);

// POST /api/ddns/update
router.post("/update",
  authenticate,
  handle.update
);

// POST /api/ddns/sync
router.post("/sync",
  validate.sync,
  authenticate,
  normalize.sync,
  handle.sync
);


// GET /api/ddns/test
router.get("/test",
  (_, res) => {
  res.status(200).type("text/plain").send("ok");
});

export default router;
