import cors from "cors";

const ORIGIN = process.env.CORS_ORIGIN;
if (!ORIGIN) {
  throw new Error("Cors origin is required");
}

export default cors({
  origin: [ORIGIN],
  credentials: true,
});
