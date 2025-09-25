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
  let content = undefined; 
  if (req.headers['cf-connecting-ip']) {
    content = req.headers['cf-connecting-ip'];
  }
  else {
    content = req.headers['x-real-ip'];
  }
  const sync_session = req.body.sync_session;
  
  let cache_data = undefined;
  if (sync_session && sync_session != null) {
    cache_data = await cache.getSync(sync_session);
  }
  
  const str_body = JSON.stringify(req.body);

  req.body.ip = content
  if (cache_data === str_body) {
    cache.sync(sync_session, req.body);
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
