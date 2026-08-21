import { execSync } from "node:child_process";
import { existsSync, unlinkSync } from "node:fs";
import path from "node:path";

const dbPath = path.resolve("prisma/test.db");
if (existsSync(dbPath)) unlinkSync(dbPath);

execSync("npx prisma migrate deploy", {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: "file:./prisma/test.db" },
});
