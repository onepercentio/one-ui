import { useMemo, useRef } from "react";
import OneUIProvider from "../../../../src/context/OneUIProvider";
import usePageControls, {
  usePaginationControlsTestIds,
} from "../../../../src/hooks/ui/usePaginationControls";

it("Should display controls when the container is scrollable", () => {
  function rand() {
    return Math.random() * 255;
  }
  function randColor() {
    return `rgb(${rand()}, ${rand()}, ${rand()})`;
  }
  function Wrapper() {
    const ref = useRef<HTMLDivElement>(null);
    const controls = usePageControls(ref);
    const rands = useMemo(() => {
      return new Array(10).fill(undefined).map(() => randColor());
    }, []);
    return (
      <div
        style={{
          width: 1200,
          position: "relative",
        }}
      >
        {controls}
        <div
          data-testid="root"
          ref={ref}
          style={{
            height: 100,
            display: "flex",
            overflow: "auto",
          }}
        >
          {new Array(10).fill(undefined).map((_, i) => (
            <div
              style={{
                backgroundColor: rands[i],
                width: 1200,
                minWidth: 1200,
                height: 100,
              }}
            >
              <h1
                style={{
                  fontSize: 100,
                }}
              >
                {i}
              </h1>
            </div>
          ))}
        </div>
      </div>
    );
  }
  cy.mount(
    <>
      <OneUIProvider
        config={{
          hook: {
            ui: {
              usePaginationControls: {
                LeftControl: () => (
                  <div
                    style={{
                      fontSize: 48,
                      fontWeight: "bold",
                    }}
                  >
                    «
                  </div>
                ),
                RightControl: () => (
                  <div
                    style={{
                      fontSize: 48,
                      fontWeight: "bold",
                    }}
                  >
                    »
                  </div>
                ),
              },
            },
          },
        }}
      >
        <Wrapper />
      </OneUIProvider>
    </>
  );
  cy.byTestId("root")
    .scrollTo(1200 * 5, 0)
    .wait(500);
  cy.byTestId(usePaginationControlsTestIds.LEFT_CONTROL)
    .click()
    .wait(100)
    .click();
});
