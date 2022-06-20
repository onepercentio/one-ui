#!/usr/bin/env node

const fetch = require("node-fetch");
const { spawn } = require("child_process");
function WaitTimeout(ml = 200) {
  return new Promise((r) => {
    setTimeout(() => {
      r();
    }, ml);
  });
}
const [, , projectId, databaseToImport] = process.argv;

if (!projectId) {
  console.error("You need to provide a project id");
  process.exit(1);
}
spawn(
  `firebase emulators:start -P ${projectId} ${
    databaseToImport ? `--import ${databaseToImport}` : ""
  }`,
  {
    cwd: undefined,
    env: process.env,
    shell: true,
    detached: true,
  }
);

(async function () {
  let breakLoop = false;
  const timeout = setTimeout(() => {
    breakLoop = true;
    console.error("Could not receive ok from firebase emulator");
    clearTimeout(timeout);
    process.exit(1);
  }, 60000);
  while (!breakLoop) {
    try {
      await fetch(`http://localhost:4000`);
      console.log("Emulator restarted");
      clearTimeout(timeout);
      process.exit(0);
    } catch (e) {}
    await WaitTimeout(1000);
  } 
  await new Promise((r) => {});
})();
