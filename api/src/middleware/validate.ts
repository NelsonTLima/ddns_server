import type { Request, Response, NextFunction} from 'express';
import valid from '@ddns/common/validations'
import cache from "@ddns/internal/queries/cache"


function login(req: Request, res: Response, next: NextFunction) {
  const { username, password } = req.body;

  if (!valid.username(username) || !valid.password(password))
    return res.unauthorized();
  return next();
}

function post(req: Request, res: Response, next: NextFunction) {
  let { name, content, proxy } = req.body;

  const invalid: Array<string> = [];

  if (!valid.proxy(proxy)) invalid.push("proxy");
  if (!valid.content(content)) invalid.push("content");
  if (!valid.fqdn(name)) invalid.push("name");

  if (invalid.length > 0)
    return res.status(400).json({
      status: "Bad Request",
      invalid_params: invalid,
    });

  return next();
}


// TODO: validate.remove



// TODO: validate.update


async function sync(req: Request, res: Response, next: NextFunction) {
  var content: string | undefined = undefined;

  if (req.headers['cf-connecting-ip']) {
    content = req.headers['cf-connecting-ip'] as string;
  }
  else if (req.headers['x-forwarded-for']) {
    const xff = req.headers['x-forwarded-for'] as string;
    content = xff.split(',')[0]?.trim();
  }
  req.body.ip = content;

  const sync_session = req.body.sync_session;
  if (!sync_session) return next();
  
  let str_req = JSON.stringify(req.body);
  let str_cache = await cache.getSync(sync_session);
  
  if (str_req === str_cache) {
    await cache.sync(sync_session, req.body);
    return res.notModified();
  }

  return next();
}

export default {
  login,
  post,
  sync,
};
