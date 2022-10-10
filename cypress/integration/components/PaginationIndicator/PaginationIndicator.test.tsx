import React, { useEffect, useRef, useState } from "react";
import { mount } from "cypress/react";

import PaginationIndicator, {
  PaginationIndicatorView as Component,
} from "../../../../src/components/PaginationIndicator/PaginationIndicator";

it("Should indicate pagination for a long number of pages", () => {
  const Interactive = function () {
    const [p, sp] = useState(4.5);
    useEffect(() => {
      setInterval(() => {
        sp((a) => (a === 20 ? 1 : a + 0.01));
      }, 1000 / 30);
    }, []);
    return (
      <>
        <h1>Animated</h1>
        <Component size={120} pages={20} page={p} />
      </>
    );
  };
  function Scroll({ pages }: { pages: number }) {
    const ref = useRef<HTMLDivElement>(null);
    return (
      <>
        <h1>Scrollable with {pages} pages</h1>
        <div style={{ width: "100vw", overflow: "auto" }} ref={ref}>
          <h1
            style={{
              fontSize: "2em",
              width: pages * 100 + "vw",
              backgroundColor: "lightcoral",
            }}
          >
            Scrollable content
          </h1>
        </div>
        <PaginationIndicator scrollableRef={ref} size={24} />
      </>
    );
  }
  const chain = cy.mountChain(() => {
    return (
      <>
        <Scroll pages={2} />
        <Scroll pages={3} />
        <Scroll pages={4} />
        <Scroll pages={4.5} />
        <Scroll pages={5} />
        <Scroll pages={6} />
        <Scroll pages={7} />
        <Scroll pages={8} />
        <Scroll pages={9} />
        <Scroll pages={10} />
        <Interactive />
        {new Array(15).fill(undefined).map((_, i) => (
          <>
            <h1>Page {i + 1}/15</h1>
            <Component size={120} pages={15} page={i + 1} />
          </>
        ))}
        {new Array(7).fill(undefined).map((_, i) => (
          <>
            <h1>Page {i + 1}/7</h1>
            <Component size={120} pages={7} page={i + 1} />
          </>
        ))}
      </>
    );
  });
  chain.remount();
});
