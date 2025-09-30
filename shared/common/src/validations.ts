import validator from 'validator';
import bogon from 'bogon';


export function ip(content: string) {
  return validator.isIP(content);
}


export function isBogon(content: string) {
  return bogon(content);
}


export function fqdn(fqdn: string) {
  return validator.isFQDN(fqdn);
}


export function content(content: string){
  return  validator.isIP(content, 4) ||
          validator.isIP(content, 6) ||
          validator.isFQDN(content);
}


export function proxy(proxy: any) {
  console.log("checando proxy");
  return (typeof proxy === "boolean");
}


export function password(password: string) {
  const requiredChars = /[-!"#$%&'()*+,-.:;<=>?@[\]^_`{|}~]/.test(password);
  const permitedChars =
    /^[a-zA-Z0-9\-!"#$%&'()*+,-.:;<=>?@[\]^_`{|}~]{8,72}$/.test(password);

  if (!requiredChars || !permitedChars) return false;
  return true;
}

export function username(username: string): boolean {
  return /^[a-zA-Z0-9._-]{3,32}$/.test(username);
}


export default {
  ip,
  fqdn,
  content,
  proxy,
  password,
  username
};
