import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const r = spawnSync("npx", ["vitest", "run", "--silent"], { encoding: "utf8", shell: true });
const out = (r.stdout || "") + (r.stderr || "");
const summary = out
  .split("\n")
  .filter((l) => /Test Files|Tests|Duration|FAIL|failed/.test(l))
  .slice(-12)
  .join("\n");
writeFileSync("vitest-summary.txt", `${summary}\nEXIT_CODE=${r.status}\n`);
