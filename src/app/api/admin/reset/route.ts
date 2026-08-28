import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

export async function POST() {
  const cwd = process.cwd();
  await new Promise<void>((resolve, reject) => {
    const child = spawn("npx", ["tsx", "prisma/seed.ts"], {
      cwd,
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
      stdio: "inherit",
    });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`seed ${code}`))));
  });
  return NextResponse.json({ ok: true, reset: true, path: path.join(cwd, "prisma") });
}
