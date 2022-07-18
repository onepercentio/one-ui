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
  if (
    ["xhr", "image"].includes(opts.displayName) ||
    ["Coverage", "readfile"].includes(opts.name) ||
    ["@cypress/code-coverage"].some((a) => opts.message ? opts.message[0] && opts.message[0].includes(a) : false)
  ) {
    delete opts.message;
    delete opts.displayName;
    delete opts.type;
    const p = new Proxy(
      {},
      {
        get: () => {
          return () => p;
        },
      }
    );

    return p;
  }

  return origLog(opts, ...other);
};
