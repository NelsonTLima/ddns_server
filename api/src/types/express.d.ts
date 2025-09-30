export {}

type Auth = {
  username: string;
  user_id: number;
  method: string;
}

declare module "express-serve-static-core" {
  interface Request {
    auth: Auth;
  }

  interface Response {
    success<T = unknown>(data?: T): this;
    error(message: string): this;
    unauthorized(): this;
    notFound(): this;
    conflict(): this;
    notModified(): this;
  }
}
