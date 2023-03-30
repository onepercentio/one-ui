import { useEffect } from "react";
import AsyncProcessProvider, {
  useAsyncProcess,
} from "../../../src/context/AsyncProcess";

describe("Business Rules", () => {
  it("Should provide a way to trigger self recovering async processes", () => {
    const spy = cy.spy(() => alert("Build is finished"));
    const spyWrite = cy.spy();
    const spyDelete = cy.spy();
    /**
     * Suppose we have the following cenario
     *
     * A user clicks a button to build something on the blockchain
     *
     * Here are the steps:
     * 1 - The user clicks the button
     * 2 - We call the contract
     * 3 - The operation is scheduled for mining
     * 4 - After mined we update the UI
     *
     * 1 - If the user reloads during this, nothing happens
     * 2 - If the user reloads while the contract is called we can't do anything because the contract didn't return yet
     * 3 - When the user reloads here, we could restore the process by recovering the thash
     * 4 - If the user reloaded before, the 3 ended, the ui will be outdated
     */
    function BaseUI() {
      const { on, waitForBuild } = useAsyncProcess();

      useEffect(() => {
        on("waitForBuild", () => spy());
      }, []);

      return <button onClick={() => waitForBuild("XPTO")}>Click me</button>;
    }

    /** This is the function that schedules the Async ui */
    // waitForCrafting();
    /** This is the generic function */
    // waitForMining();

    /** This should be a callback */
    // onCrafted();

    function BaseCenario() {
      return <BaseUI />;
    }
    cy.mount(
      <AsyncProcessProvider
        persistence={{
          recover: () => [],
          remove: spyDelete,
          write: spyWrite,
        }}
        triggers={{
          waitForBuild: () =>
            new Promise<void>((r) => {
              setTimeout(() => {
                r();
              }, 1000);
            }),
        }}
      >
        <BaseCenario />
      </AsyncProcessProvider>
    );
    cy.get("button").wait(1000).click();

    cy.waitUntil(() => spyWrite.callCount > 0);
    cy.waitUntil(() => spy.callCount > 0);
    cy.waitUntil(() => spyDelete.callCount > 0);
  });
});
