import React, { useEffect, useRef, useState } from "react";
import { mount } from "cypress/react";

import PaginationIndicator, {
  PaginationIndicatorView as Component,
} from "../../../../src/components/PaginationIndicator/PaginationIndicator";

it.only("Should indicate pagination for a long number of pages", () => {
  cy.viewport(1920, 1080 * 2.5);
  const Interactive = function ({ size }: { size: number }) {
    const [p, sp] = useState(1);
    useEffect(() => {
      setInterval(() => {
        sp((a) => Number((a === size ? 1 : a + 0.01).toFixed(2)));
      }, 100 / size);
    }, []);

    return (
      <>
        <h1>Animated {size}</h1>
        <Component size={120} pages={size} page={p} />
        <h1>{p}</h1>
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
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <PaginationIndicator scrollableRef={ref} size={24} />
        </div>
      </>
    );
  }
  const chain = cy.mountChain(() => {
    return (
      <>
        {/* <Scroll pages={2} />
        <Scroll pages={3} />
        <Scroll pages={4} />
        <Scroll pages={4.5} />
        <Scroll pages={5} />
        <Scroll pages={6} />
        <Scroll pages={7} />
        <Scroll pages={8} />
        <Scroll pages={9} />
        <Scroll pages={10} /> */}
        {/* <Interactive size={20} />
        <Interactive size={9} /> */}
        {/* <Interactive size={8} />
        <Interactive size={7} />
        <Interactive size={6} />
        <Interactive size={5} />
        <Interactive size={4} />
        <Interactive size={3} />
        <Interactive size={2} /> */}
        {new Array(15).fill(undefined).map((_, i) => (
          <>
            <h1>Page {i + 1}/15</h1>
            <Component size={120} pages={15} page={i + 1} onClickPage={alert} />
          </>
        ))}
        {/* {new Array(7).fill(undefined).map((_, i) => (
          <>
            <h1>Page {i + 1}/7</h1>
            <Component size={120} pages={7} page={i + 1} />
          </>
        ))} */}
      </>
    );
  });
  chain.remount();
});

it("Should be able to change page based on scroll", () => {
  function Wrapper() {
    const ref = useRef<HTMLDivElement>(null);
    return (
      <>
        <div
          ref={ref}
          style={{
            width: "400px",
            overflow: "auto",
          }}
        >
          <h1 style={{ width: "1640px" }}>CONTEUDO</h1>
        </div>
        <PaginationIndicator
          scrollableRef={ref}
          size={24}
          estimatedWidth={1640}
        />
      </>
    );
  }
  mount(
    <>
      <Wrapper />
    </>
  );
});

function Wrapper({ page }: { page: number }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <>
      <div style={{ width: "100vw", overflow: "auto" }} ref={ref}>
        <h1
          style={{
            fontSize: "2em",
            width: `calc(${page * 100 + "vw"} + 20px)`,
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

describe("Bugfix", () => {
  it("Should not have unwanted dot location when there is a single page", () => {
    mount(
      <>
        <Wrapper page={1} />
        <Wrapper page={2} />
      </>
    );
  });
});

it("Should be able to indicate final page scroll correctly", () => {
  mount(
    <>
      <Wrapper page={2.5} />
    </>
  );
});
