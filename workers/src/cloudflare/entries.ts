import type {
  DeletionContent,
  PatchContent,
  PostContent
} from '../types/entries.js';
import validator from 'validator';

export abstract class Entry {
  abstract readonly kind: "delete" | "patch" | "post";
  public readonly name: string;
  constructor(name:string){
    this.name = name;
  }
}

export class Deletion extends Entry {
  readonly kind = "delete" as const;
  public readonly content: DeletionContent;
  constructor(id: string, name: string) {
    super(name);
    this.content = {
      id: id,
    };
  }
}

export class Patch extends Entry{
  readonly kind = "patch" as const;
  public readonly content: PatchContent; 
  constructor(id: string,name: string, content: string, proxied: boolean) {
    super(name);
    let type = 'CNAME'
    if (validator.isIP(content, 4)){
       type = 'A';
    } else if (validator.isIP(content, 6)) {
       type = 'AAAA'
    }
    this.content = {
      id: id,
      content: content,
      proxied: proxied,
      type: type
    };
    console.log(this.content);
  }
}

export class Post extends Entry{
  readonly kind = "post" as const;
  public readonly content: PostContent; 
  constructor(name: string, content: string, proxied: boolean) {
    super(name);
    let type = 'CNAME'
    if (validator.isIP(content, 4)){
       type = 'A';
    } else if (validator.isIP(content, 6)) {
       type = 'AAAA'
    }
    const ttl = proxied ? 1 : 120;
    this.content = {
      name: name,
      type: type,
      content: content,
      proxied: proxied,
      ttl: ttl,
    };
  }
}

export default { Deletion, Patch, Post };
