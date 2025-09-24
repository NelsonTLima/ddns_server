import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pg from "pg";

const pgPool = new pg.Pool();
const PgSession = connectPgSimple(session);

export default session({
  store: new PgSession({
    pool: pgPool,
    tableName: "session",
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
});
