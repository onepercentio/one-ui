import { mount } from "cypress/react";
import { MutableRefObject, RefObject, useCallback, useEffect } from "react";
import useElementFit from "../../../src/hooks/useElementFit";
import {
  useLocalPagination,
  useContainerPagination,
} from "../../../src/hooks/usePagination";

describe("Business rules", () => {
  describe("Paginating an scrollable element", () => {
    it("Shoulld get next page when it scrolls 70% of the total height", () => {
      cy.viewport(1920, 1000);
      const paginationCallback = cy.spy();
      function Wrapper({ amount }: { amount: number }) {
        const { scrollableRef } = useContainerPagination(paginationCallback);
        return (
          <div
            ref={scrollableRef}
            style={{
              height: "100vh",
              width: "100vw",
              background: "linear-gradient(#f00, #f006)",
              overflow: "auto",
            }}
            data-testid="root"
          >
            {new Array(amount).fill(
              <div
                style={{
                  background: "linear-gradient(#0f0a, #0f06)",
                  width: "100%",
                  height: 100,
                }}
              />
            )}
          </div>
        );
      }
      const chain = cy.mountChain((amount: number) => (
        <Wrapper amount={amount} />
      ));
      chain.remount(20);
      cy.byTestId("root")
        .scrollTo(0, 100)
        .wait(500)
        .scrollTo(0, 200)
        .wait(500)
        .scrollTo(0, 300)
        .wait(500)
        .scrollTo(0, 399)
        .wait(500)
        .then(() => expect(paginationCallback).to.not.be.called);
      cy.byTestId("root")
        .scrollTo(0, 450)
        .wait(500)
        .scrollTo(0, 550)
        .wait(500)
        .then(() => expect(paginationCallback).to.be.calledOnce);
      chain.remount(40).then(() => paginationCallback.resetHistory());
      cy.byTestId("root")
        .scrollTo(0, 600)
        .wait(500)
        .then(() => expect(paginationCallback).to.not.be.called);
      cy.byTestId("root")
        .scrollTo(0, 2400)
        .wait(500)
        .then(() => expect(paginationCallback).to.be.calledOnce);
    });

    it.only("Should be able to paginate local instance items", () => {
      const localItems = new Array(10000)
        .fill(undefined)
        .map((_, i) => String(i + 1));
      for (let [w, h, l] of [
        [2000, 1000, 55],
        [320, 640, 4],
      ]) {
        cy.viewport(w, h);
        const Square = ({ num }: { num: string }) => {
          return (
            <div
              data-testid="square"
              style={{
                background: "radial-gradient(red,green,blue)",
                width: 180,
                height: 210,
                fontSize: 120,
                textAlign: "center",
                color: "white",
              }}
            >
              {num}
            </div>
          );
        };
        const Wrapper = () => {
          const { ref, itemsToShow } = useElementFit(180, 210);
          const { items, getPage, getNextPage } = useLocalPagination(
            localItems,
            (itemsToShow || 0) * 2
          );
          const { scrollableRef } = useContainerPagination(getNextPage);

          useEffect(() => {
            if (itemsToShow) getPage(0);
          }, [itemsToShow]);

          return (
            <div
              ref={(thisRef) => {
                (scrollableRef as MutableRefObject<HTMLDivElement>).current = (
                  ref as MutableRefObject<HTMLDivElement>
                ).current = thisRef!;
              }}
              data-testid="root"
              style={{
                height: "100vh",
                width: "100vw",
                background: "linear-gradient(#00f, #00f6)",
                display: "flex",
                flexWrap: "wrap",
                overflow: "auto",
              }}
            >
              {items?.map((i) => (
                <Square key={i} num={i} />
              ))}
            </div>
          );
        };
        mount(<Wrapper />);
        cy.byTestId("square").should("have.length", l * 2);
        cy.byTestId("root").wait(1000).scrollTo("bottom");
        cy.byTestId("square").should("have.length", l * 4);
        cy.byTestId("root").wait(1000).scrollTo("bottom");
        cy.byTestId("square").should("have.length", l * 6);
        cy.byTestId("root").wait(1000).scrollTo("bottom");
        cy.byTestId("square").should("have.length", l * 8);
      }
    });
  });
});
