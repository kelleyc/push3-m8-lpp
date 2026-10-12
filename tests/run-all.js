/* Runs every tests/*.test.js in its own Node process. */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const files = fs.readdirSync(__dirname).filter((f) => f.endsWith(".test.js")).sort();
let failed = 0;
for (const file of files) {
  console.log("\n=== " + file + " ===");
  const r = spawnSync(process.execPath, [path.join(__dirname, file)], { stdio: "inherit" });
  if (r.status !== 0) { failed += 1; console.error(">>> FAILED: " + file); }
}
console.log("\n" + files.length + " test file(s), " + (files.length - failed) + " passed, " + failed + " failed");
process.exit(failed ? 1 : 0);
