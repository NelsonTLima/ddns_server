import type { Request, Response, NextFunction} from 'express';
import { getUserByName } from "@ddns/internal/queries/db";
import bcrypt from "bcrypt";

export async function authenticate(req: Request,res: Response, next: NextFunction) {
  console.log('hello')
  if (req.session?.user_id) {
    if (!req.session.username || !req.session.user_id)
      throw new Error("user name and id is required.");
    req.auth = {
      username: req.session.username,
      user_id: req.session.user_id,
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
    user_id: user.id,
    method: "token",
  };
  return next();
}
