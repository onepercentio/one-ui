import React, { useEffect, useState } from "react";
import { mount } from "cypress/react";
import * as AllExamples from "../../../../src/components/Tabs/Tabs.stories";
import Tabs, { TabType } from "components/Tabs/Tabs";

it("All examples mount at least", () => {
  for (let ExampleName in AllExamples) {
    if (ExampleName === "default") return;
    const Example = AllExamples[ExampleName];
    mount(<Example {...Example.args} />);
    cy.wait(500);
  }
});

it.only("Should be able to cover all items", () => {
  cy.viewport(2100, 1080)
  function Wrapper({ s }: { s: string }) {
    const [selected, ss] = useState("");
    useEffect(() => {
      ss(s);
    }, [s]);
    return (
      <>
        {[10, 18, 24, 32, 48, 72].map((fontSize) => (
          <div style={{ fontSize }}>
            <p>Font size {fontSize}px</p>
            <Tabs
              onSelect={(a) => {
                ss(a);
              }}
              selected={selected}
              options={["Example 1", "O", "This is a long ass option"].map((w) => ({
                id: w,
                label: w,
              }))}
              type={TabType.FULL}
            />
          </div>
        ))}
      </>
    );
  }
  const chain = cy.mountChain((s: string) => <Wrapper s={s} />);
  chain.remount("").wait(2000);
  chain.remount("This is a long ass option");
});
