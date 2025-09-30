import type { Request, Response, NextFunction } from "express";
import valid from "@ddns/common/validations";

const DOMAIN = process.env.DOMAIN;
const CF_PROXY = process.env.CF_PROXY;

if (!CF_PROXY) throw new Error("CF_PROXY is required");
if (!DOMAIN) throw new Error("DOMAIN is required")


function post(req: Request, _: Response, next: NextFunction) {
  if (req.body.content === undefined) req.body.content = DOMAIN;
  if (valid.fqdn(req.body.content)) req.body.proxy = CF_PROXY;
  
  if (req.body.proxy === "true") req.body.proxy = true;
  if (req.body.proxy === "false") req.body.proxy = false;

  req.body.name = `${req.body.name}.${DOMAIN}`;
  next();
}


// TODO: Write this normalize function.
function sync (_req: Request, _res: Response, next: NextFunction) {
  next();
}

export default {
  post, sync
};
