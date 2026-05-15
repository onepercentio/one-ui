const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const gitDir = path.join(rootDir, ".git");

if (!fs.existsSync(gitDir)) {
  process.exit(0);
}

const hooksDir = path.join(gitDir, "hooks");
const preCommitHookPath = path.join(hooksDir, "pre-commit");
const hookContent = `#!/bin/sh

node scripts/sync-readme-version.js || exit 1
git add README.md
`;

fs.mkdirSync(hooksDir, { recursive: true });
fs.writeFileSync(preCommitHookPath, hookContent);
fs.chmodSync(preCommitHookPath, 0o755);