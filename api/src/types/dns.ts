export interface ConfDomain {
  name: string;
  proxy: boolean;
}

export interface RecordView {
  id: number;
  user_id: number;
  cloudflare_id: string;
  name: string;
  content: string;
  proxied: boolean;
  created_on: string;
  modified_on: string;
}
