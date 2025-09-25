import valid from '#common/validations.js'
import cache from "#queries/cache.js"

function login(req, res, next) {
  const { username, password } = req.body;
  if (!valid.username(username) || !valid.password(password))
    return res.unauthorized();
  next();
}

function post(req, res, next) {
  let { name, content, proxy } = req.body;

  const invalid = [];

  if (!valid.proxy(proxy)) invalid.push("proxy");
  if (!valid.content(content)) invalid.push("content");
  if (!valid.fqdn(name)) invalid.push("name");

  if (invalid.length > 0)
    return res.status(400).json({
      status: "Bad Request",
      invalid_params: invalid,
    });

  next();
}


// TODO: validate.remove
function remove(req, res, next) {
  console.log(req.body);
  console.log(res.body);
  next();
}


// TODO: validate.update
function update(req, res, next) {
  console.log(req.body);
  console.log(res.body);
  next();
}

async function sync(req, res, next) {
  const sync_session = req.body.sync_session;
  if (!sync_session) return next();
  
  var content = undefined;
  if (req.headers['cf-connecting-ip']) {
    console.log('cloudflare');
    content = req.headers['cf-connecting-ip'];
  }
  else {
    console.log('not cloudflare');
    content = req.headers['x-forwarded-for'].split(',')[0].trim();
    console.log(content);
  }
  req.body.ip = content;

  let str_req = JSON.stringify(req.body);
  let str_cache = await cache.getSync(sync_session);
  
  if (str_req === str_cache) {
    await cache.sync(sync_session, req.body);
    return res.notModified();
  }

  next();
}

export default {
  login,
  post,
  remove,
  update,
  sync,
};
