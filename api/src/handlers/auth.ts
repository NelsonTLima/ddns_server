import type { Request, Response } from 'express';
import crypto from "crypto";
import bcrypt from "bcrypt";
import db from "@ddns/internal/queries/db";


export async function login(req: Request, res: Response): Promise<Response> {
  const { username, password } = req.body;

  const user = await db.getUserByName(username);
  if (!user) return res.unauthorized();

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.unauthorized();

  req.session.user_id = user.id;
  req.session.username = user.name;

  return res.success();
}


export async function newToken(req: Request, res: Response) {
  const rawToken = crypto.randomBytes(32).toString("hex"); // 64 chars
  const hashedToken = await bcrypt.hash(rawToken, 12);

  await db.updateTokenHashByUserId(hashedToken, req.auth.user_id);
  return res.success(rawToken);
}


export async function logout(req: Request, res: Response): Promise<Response> {
  if (!req.session) {
    res.clearCookie("connect.sid");
    return res.status(204).end();
  }

  await new Promise<void>((resolve, reject) => {
    req.session!.destroy(err => (err ? reject(err) : resolve()));
  });

  res.clearCookie("connect.sid");
  return res.status(204).end();
}


export async function keepSession(req: Request, res: Response): Promise<Response> {
  if (!req.session.user_id) {
    return res.unauthorized();
  }
  return res.success();
}

export default { login, logout, keepSession, newToken };
