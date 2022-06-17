// @ts-nocheck

import { Firestore } from "firebase/firestore";
import { FirebaseStorage } from "firebase/storage";
import {
  RulesTestEnvironment,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";

// import { ChildProcess, execSync, spawn, SpawnSyncReturns } from "child_process";
export function WaitTimeout(ml = 200) {
  return new Promise<void>((r) => {
    setTimeout(() => {
      r();
    }, ml);
    if (window.Cypress) return;
    else if (jest.isMockFunction(setTimeout)) jest.advanceTimersByTime(ml);
  });
}

class FirebaseEmulatorInterface {
  private process!: any;

  private killRelatedPorts() {
    for (let port of [4000, 4400, 8055, 8080]) {
      try {
        if (window.Cypress)
          cy.exec(`yarn kill-port ${port}`, { failOnNonZeroExit: true })
        else
          require("child_process").execSync(`kill -9 $(lsof -t -i:${port})`, {
            stdio: "ignore",
          });
      } catch (e) {
        console.error("Error when killing port", port, e);
      }
    }
  }

  start(fakeProjectName: string, databaseToImport?: string = "") {
    if (sessionStorage.getItem("last-database") === databaseToImport)
      return;
    this.killRelatedPorts();
    if (window.Cypress) {
      const command = `yarn start-emulator ${fakeProjectName} ${databaseToImport}`;
      cy.exec(command, {
        timeout: 60000, // Instant fail
      });
      sessionStorage.setItem("last-database", databaseToImport)
    } else {
      this.process = require("child_process").spawn(
        "firebase",
        ["emulators:start", "-P", "whz-test"],
        {
          stdio: "pipe",
        }
      );

      return new Promise<void>((r, rej) => {
        let fullOutput = "";
        const timeoutSeconds = 20;
        const unexpectedTimeout = setTimeout(() => {
          rej(
            new Error(`Waited for 20 seconds and didn't received ok from emulator.
        
Below is the full output:

--------EMULATOR START OUTPUT--------

${fullOutput}

--------EMULATOR START OUTPUT--------`)
          );
        }, timeoutSeconds * 1000);
        this.process.stdout!.on("data", (txt) => {
          const output = txt.toString();
          fullOutput += output;

          if (output.includes("All emulators ready!")) {
            clearTimeout(unexpectedTimeout);
            setTimeout(() => {
              r();
            }, 2000);
          }
        });
      });
    }
  }
  async stop(immediate?: boolean, timeoutSec?: number) {
    const write = window.Cypress ? console.log : process.stdout.write;
    const timeout = (timeoutSec || 10) * 1000;
    const kill = (r: Function) => {
      if (window.Cypress) this.killRelatedPorts();
      else this.process.kill("SIGINT");

      setTimeout(() => {
        r();
      }, 2000);
    };
    if (immediate) {
      return new Promise((res) => {
        kill(res);
      });
    } else {
      const clear = (message: string) => {
        if (window.Cypress) return;
        write(new Array(message.length).fill("\r").join(""));
        write(new Array(message.length).fill(" ").join(""));
      };
      return new Promise((res) => {
        let remaining = timeout / 1000;
        let message!: string;
        const interval = setInterval(() => {
          if (message) clear(message);
          message = `Killing emulator in ${remaining} seconds`;
          write(message);

          remaining -= 1;
          if (remaining === 0) {
            kill(res);
            clear(message);
            write("Emulator killed");
            clearInterval(interval);
          }
        }, 1000);
      });
    }
  }
}

export const EmulatorController = new FirebaseEmulatorInterface();

export function cyPromise(someAssertion: { then: Function }) {
  return new Promise((r) => {
    someAssertion.then(r);
  });
}

export async function initTestFirebase(
  fakeProjectId: string,
  setupEnv?: (
    ctx: Firestore,
    storageCtx: FirebaseStorage,
    testEnv: RulesTestEnvironment
  ) => Promise<void>
): Promise<RulesTestEnvironment> {
  const testEnv = await initializeTestEnvironment({
    projectId: fakeProjectId,
    firestore: {
      host: "localhost",
      port: 8080,
    },
    storage: {
      host: "localhost",
      port: 9199,
    },
  });

  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const firestore = ctx.firestore({
      experimentalForceLongPolling: true,
    });

    const storage = ctx.storage() as any;
    if (setupEnv) await setupEnv(firestore, storage, testEnv);
  });
  return testEnv;
}
