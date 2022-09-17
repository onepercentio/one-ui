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
        .scrollTo(0, 200)
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

    const Square = ({ num }: { num: string }) => {
      return (
        <div
          data-testid="square"
          style={{
            backgroundColor: "black",
            width: 180,
            height: 210,
            fontSize: 48,
            textAlign: "center",
            color: "white",
          }}
        >
          {num}
        </div>
      );
    };
    const Wrapper = ({ localItems }: { localItems: any[] }) => {
      const { ref, itemsToShow } = useElementFit(180, 210);
      const { items, getPage, getNextPage } = useLocalPagination(
        localItems,
        (itemsToShow || 0) * 2
      );
      const { scrollableRef } = useContainerPagination(getNextPage);

      useEffect(() => {
        if (itemsToShow && localItems) {
          alert("Getting first page of items");
          getPage(0);
        }
      }, [itemsToShow, localItems]);

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
            // background: "linear-gradient(#00f, #00f6)",
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

    function newArr(prefix: string = "") {
      return new Array(2000)
        .fill(undefined)
        .map((_, i) => prefix + String(i + 1));
    }

    it("Should be able to paginate local instance items", () => {
      const localItems = newArr();
      for (let [w, h, l] of [
        [2000, 1000, 55],
        [320, 640, 4],
      ]) {
        cy.viewport(w, h);
        mount(<Wrapper localItems={localItems} />).wait(1000);
        cy.byTestId("square").should("have.length", l * 2);
        for (let i = 0; i < 20; i++) {
          cy.byTestId("root").scrollTo("bottom");
          cy.byTestId("square").should("have.length", l * 2 + l * (++i + 1));
        }
      }
    });
    it("Should be able to handle changes correctly", () => {
      const chain = cy.mountChain((arr: any[]) => <Wrapper localItems={arr} />);
      cy.viewport(800, 600);
      const l = 12;
      for (let arr of [newArr("_ "), newArr(". ")]) {
        chain.remount(arr).wait(1000);
        for (let i = 0; i < 20; i++) {
          cy.byTestId("root").scrollTo("bottom");
        }
        cy.get("body").then((a) => cy.wrap(a.get(0).innerText).snapshot());
      }
    });
  });
});
