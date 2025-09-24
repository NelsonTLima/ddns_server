import { getUserByName } from "#queries/db.js";
import bcrypt from "bcrypt";

export async function authenticate(req, res, next) {
  if (req.session?.userId) {
    req.auth = {
      username: req.session.username,
      userId: req.session.userId,
      method: "session",
    };
    return next();
  }

  const username = req.body.username;
  if (!username) return res.unauthorized();

  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.unauthorized();

  const [type, token] = authHeader.trim().split(/\s+/);
  if (type !== "Bearer" || !token) return res.unauthorized();

  const user = await getUserByName(username);
  if (!user || !user.token_hash) return res.unauthorized();

  const match_token = await bcrypt.compare(token, user.token_hash);
  if (!match_token) return res.unauthorized();

  req.auth = {
    username: user.name,
    userId: user.id,
    method: "token",
  };
  return next();
}
