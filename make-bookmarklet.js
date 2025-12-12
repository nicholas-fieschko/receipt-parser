#!/usr/bin/env node
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const src = process.argv[2] || "src/bookmarklet.js";

// make a temp file path
const tmpFile = path.join(os.tmpdir(), `bookmarklet-${Date.now()}.js`);

// read, strip, write
const code = fs.readFileSync(src, "utf8");
const stripped = code.replace(/\bexport\s+/g, "");
fs.writeFileSync(tmpFile, stripped, "utf8");

// run `bookmarklet tmpFile`
const child = spawn("bookmarklet", [tmpFile], {
  stdio: ["ignore", "pipe", "inherit"],
});

// pipe result to stdout so caller can `| pbcopy`
child.stdout.on("data", (chunk) => process.stdout.write(chunk));

child.on("close", () => {
  fs.unlink(tmpFile, () => {}); // best-effort cleanup
});
