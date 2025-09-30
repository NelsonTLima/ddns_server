import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "pg";


const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) throw new Error("Session secret is required");

const pgPool = new Pool();
const PgSession = connectPgSimple(session);

const seconds = 1000; // ms
const minutes = 60 * seconds;
const hours = 60 * minutes;
const days = 24 * hours;

export default session({
  store: new PgSession({
    pool: pgPool,
    tableName: "session",
  }),
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * days,
  },
});
