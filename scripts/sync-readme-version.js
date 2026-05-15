const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const packageJsonPath = path.join(rootDir, "package.json");
const readmePath = path.join(rootDir, "README.md");

const { version } = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const readme = fs.readFileSync(readmePath, "utf8");
const bundleUrlPattern = /releases\/download\/v\d+\.\d+\.\d+\/bundle\.js/g;
const nextBundlePath = `releases/download/v${version}/bundle.js`;

if (!bundleUrlPattern.test(readme)) {
  throw new Error("README.md does not contain a release bundle URL to sync.");
}

const nextReadme = readme.replace(bundleUrlPattern, nextBundlePath);

if (nextReadme !== readme) {
  fs.writeFileSync(readmePath, nextReadme);
  console.log(`Synced README bundle URL to v${version}.`);
}