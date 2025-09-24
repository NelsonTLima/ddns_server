import express from "express";
import session from "#config/session.js";
import cors from "#config/cors.js";
import routes from "#routes";
import { responseMethods } from "#middleware/responses.js";

const PORT = 3000;

const app = express();
app.use(express.json());
app.use(responseMethods);
app.disable("x-powered-by");
app.use(cors);
app.use(session);
app.use(routes);
app.set("trust proxy", "loopback");

app.listen(PORT, () => {
  console.log(`Listening at: http://localhost:${PORT}`);
});
