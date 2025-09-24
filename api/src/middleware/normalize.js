import valid from "#common/validations.js";

function post(req, _, next) {
  if (req.body.content === undefined) req.body.content = process.env.DOMAIN;
  if (valid.fqdn(req.body.content)) req.body.proxy = process.env.CF_PROXY;
  
  if (req.body.proxy === "true") req.body.proxy = true;
  if (req.body.proxy === "false") req.body.proxy = false;

  req.body.name = `${req.body.name}.${process.env.DOMAIN}`;
  next();
}


// TODO: Write this normalize function.
function sync (_req, _res, next) {
  next();
}

export default {
  post, sync
};
