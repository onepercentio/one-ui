import ContextAsyncControlProvider from "context/ContextAsyncControl";
import useAsyncControl from "hooks/useAsyncControl";
import { createContext, useContext, useState } from "react";

it("Should trigger only required refreshs", () => {
  function ExecutesSomeAsyncProcess() {
    alert("Render cycle for val");
    const state = useAsyncControl(
      {
        load: () =>
          new Promise<void>((r, rej) => {
            setTimeout(() => {
              if (Math.random() < 0.5) r();
              else rej(new Error("PREDICTABLE"));
            }, 3000);
          }),
      },
      "share_this"
    );
    return (
      <div>
        <p>Is loading {String(state.loading)}</p>
        <p>Is error {String(state.error)}</p>
        <button onClick={() => state.load()}>Click to trigger process</button>
      </div>
    );
  }
  function Wrapper() {
    alert("Render cycle for another wrapper");
    return (
      <div>
        <ExecutesSomeAsyncProcess />
        <ExecutesSomeAsyncProcess />
      </div>
    );
  }
  function StateMantainer() {
    return (
      <ContextAsyncControlProvider>
        <Wrapper />
      </ContextAsyncControlProvider>
    );
  }
  cy.mount(<StateMantainer />);
});
