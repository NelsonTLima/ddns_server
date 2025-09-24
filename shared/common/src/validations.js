import validator from 'validator';
import bogon from 'bogon';


export function ip(content) {
  return validator.isIP(content)
}


export function isBogon(content) {
  return bogon(content);
}


export function fqdn(fqdn) {
  return validator.isFQDN(fqdn);
}


export function content(content){
  return  validator.isIP(content, 4) ||
          validator.isIP(content, 6) ||
          validator.isFQDN(content);
}


export function proxy(proxy) {
  return (typeof proxy === "boolean");
}


export function password(password) {
  const requiredChars = /[-!"#$%&'()*+,-.:;<=>?@[\]^_`{|}~]/.test(password);
  const permitedChars =
    /^[a-zA-Z0-9\-!"#$%&'()*+,-.:;<=>?@[\]^_`{|}~]{8,72}$/.test(password);

  if (!requiredChars || !permitedChars) return false;
  return true;
}


export function username(username) {
  if (username) return true;
}


export default {
  ip,
  fqdn,
  content,
  proxy,
  password,
  username
};
