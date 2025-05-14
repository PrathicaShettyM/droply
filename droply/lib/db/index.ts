import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

import * as schema from "./schema"

// database connection
const sql = neon(process.env.DATABASE_URL!)

export const db = drizzle(sql, {schema}) // use this when u want to fire up queries from through neon

export {sql} // use this when u want to fire up raw sql queries
