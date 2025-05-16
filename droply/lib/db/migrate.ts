import { migrate } from "drizzle-orm/neon-http/migrator";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

import * as dotenv from "dotenv";

dotenv.config({path: ".env.local"});

if(!process.env.DATABASE_URL) {
    throw new Error("Database url is not set in .env.local");
}

async function runMigration(){
    try{
        const sql = neon(process.env.DATABASE_URL!)
        const db = drizzle(sql)

        await migrate(db, {migrationsFolder: "./drizzle"});
        console.log("All migrations are done successfully");
    } catch(error) {
        console.log("There is an issue with the migrations");
        console.log("Error: " + error);
        process.exit(1);
    }
}

runMigration();