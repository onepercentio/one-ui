// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')

const origLog = Cypress.log;
Cypress.log = function (opts, ...other) {
  const isFirebaseEmulatorInitialization =
    opts.message && opts.message.includes && opts.message.includes("firebase emulators");
  const isExecError =
    opts.error && opts.error.docsUrl && opts.error.docsUrl.includes("/exec");
  const isKillCommand = opts.message && opts.message.includes && opts.message.includes("lsof -t -i");
  const isFetch8080 = opts.url === "http://localhost:4000/";
  const isXHRWithFirebaseEmulator =
    opts.displayName === "xhr" &&
    (!opts.url ||
      [8090, 9199].some((port) =>
        opts.url.startsWith(`http://localhost:${port}`)
      ));
  if (
    isXHRWithFirebaseEmulator ||
    isFetch8080 ||
    isFirebaseEmulatorInitialization ||
    isExecError ||
    isKillCommand
  ) {
    return;
  }

  return origLog(opts, ...other);
};
