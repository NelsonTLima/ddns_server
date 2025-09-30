export interface CloudflareResponse {
  deletes: [] | null;
  patches: [] | null;
  puts: [] | null;
  posts: [] | null;
};

export interface CloudflareRequest {
  zone_id: string;
  deletes: [];
  patches: [];
  posts: [];
}
