export {}

declare module "express-session" {
  interface SessionData {
    user_id: number;
    username: string;
  }
}
