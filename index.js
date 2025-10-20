#!/usr/bin/env node
const {execSync} = require("child_process");
const path = require("path");

try {
  console.log("Building project...");
  execSync(`tsc -P ${path.resolve(__dirname, "tsconfig.json")}`, {stdio: "inherit"});
  console.log("Running generator...");
  require(path.resolve(__dirname, "./dist/node_modules/angular-sitemap-generator/generator.js"));
} catch (e) {
  console.error("Build failed:", e);
  process.exit(1);
}
