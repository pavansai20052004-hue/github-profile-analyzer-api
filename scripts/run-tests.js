const { execFileSync } = require("child_process");

execFileSync(process.execPath, ["scripts/check-syntax.js"], { stdio: "inherit" });
execFileSync(process.execPath, ["--test"], { stdio: "inherit" });
