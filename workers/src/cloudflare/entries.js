import validator from 'validator';

export class Deletion {
  constructor(id) {
    this.content = {
      id: id,
    };
  }
}

export class Patch {
  constructor(id, content, proxy) {
    let type = 'CNAME'
    if (validator.isIP(content, 4)){
       type = 'A';
    } else if (validator.isIP(content, 6)) {
       type = 'AAAA'
    }
    this.content = {
      id: id,
      content: content,
      proxied: proxy,
      type: type
    };
    console.log(this.content);
  }
}

export class Post {
  constructor(name, content, proxy) {
    let type = 'CNAME'
    if (validator.isIP(content, 4)){
       type = 'A';
    } else if (validator.isIP(content, 6)) {
       type = 'AAAA'
    }
    const ttl = proxy ? 1 : 120;
    this.content = {
      name: name,
      type: type,
      content: content,
      proxied: proxy,
      ttl: ttl,
    };
  }
}

export default { Deletion, Patch, Post };
