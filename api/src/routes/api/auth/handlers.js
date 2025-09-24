import crypto from "crypto";
import bcrypt from "bcrypt";
import { getUserByName, updateTokenHashByUserId } from "#queries/db.js";


async function login(req, res) {
  console.log("logging in");
  const { username, password } = req.body;

  const user = await getUserByName(username);
  if (!user) return res.unauthorized();

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.unauthorized();

  req.session.userId = user.id;
  req.session.username = user.name;

  console.log("success");

  return res.success();
}


async function newToken(req, res) {
  const rawToken = crypto.randomBytes(32).toString("hex"); // 64 chars
  const hashedToken = await bcrypt.hash(rawToken, 12);

  await updateTokenHashByUserId(hashedToken, req.auth.userId);
  return res.success(rawToken);
}


function logout(req, res) {
  req.session.destroy();
  res.status(200).success();
}


async function keepSession(req, res) {
  if (!req.session.userId) {
    console.log("não tem sessão");
    return res.unauthorized();
  }
  return res.success();
}

export default { login, logout, keepSession, newToken };
