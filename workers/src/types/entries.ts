export interface DeletionContent {
  id: string;
}

export interface PatchContent {
  id: string;
  content: string;
  proxied: boolean;
  type: string;
}

export interface PostContent {
  name: string;
  type: string;
  content: string;
  proxied: boolean;
  ttl: number;
}
