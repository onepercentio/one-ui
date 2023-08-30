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
  function Wrapper({ s }: { s: string }) {
    const [selected, ss] = useState("");
    useEffect(() => {
      ss(s);
    }, [s]);
    return (
      <Tabs
        onSelect={(a) => {
          ss(a);
        }}
        selected={selected}
        options={["Example 1", "Example 2", "Example 3"].map((w) => ({
          id: w,
          label: w,
        }))}
        type={TabType.FULL}
      />
    );
  }
  const chain = cy.mountChain((s: string) => <Wrapper s={s} />);
  chain.remount("").wait(2000);
  chain.remount("Example 2");
});
