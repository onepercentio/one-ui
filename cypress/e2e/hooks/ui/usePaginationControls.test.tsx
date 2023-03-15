import { useMemo, useRef } from "react";
import OneUIProvider from "../../../../src/context/OneUIProvider";
import usePageControls, {
  usePaginationControlsTestIds,
} from "../../../../src/hooks/ui/usePaginationControls";
function mount(childWidth: number = 1200, count: number = 10) {
  function rand() {
    return Math.random() * 255;
  }
  function randColor() {
    return `rgb(${rand()}, ${rand()}, ${rand()})`;
  }
  function Wrapper() {
    const ref = useRef<HTMLDivElement>(null);
    const { controls, checkControlsRequirement } = usePageControls(ref, {
      snapToCutElement: true,
    });
    const rands = useMemo(() => {
      return new Array(count).fill(undefined).map(() => randColor());
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
          {new Array(count).fill(undefined).map((_, i) => (
            <div
              style={{
                background:
                  childWidth !== 1200
                    ? `linear-gradient(to right, red 5%, ${rands[i]} 5%, ${rands[i]} 95%, blue 95%)`
                    : rands[i],
                width: childWidth,
                minWidth: childWidth,
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
}
it("Should display controls when the container is scrollable", () => {
  mount();
  cy.byTestId("root")
    .scrollTo(1200 * 5, 0)
    .wait(500);
  cy.byTestId(usePaginationControlsTestIds.LEFT_CONTROL)
    .click()
    .wait(100)
    .click();
});

describe("Improvement", () => {
  it.only("When dealing with multi page, should not skip split elements from page", () => {
    function _mount() {
      cy.viewport(1200, 200);
      mount(250, 20);
    }
    function scroll(howMuchToScroll: number) {
      cy.byTestId("root").scrollTo(howMuchToScroll, 0).wait(500);
    }
    function moundAndTestRight(howManyPagesToSkip: number) {
      _mount();
      const howMuchToScroll = howManyPagesToSkip * 250 + 100;
      scroll(howMuchToScroll);
      cy.byTestId(usePaginationControlsTestIds.RIGHT_CONTROL)
        .click()
        .wait(1000);
      cy.contains(String(howManyPagesToSkip + 4)).inViewport();
    }
    function mountAndTestLeft(howManyPagesToSkip: number) {
      _mount();
      const howMuchToScroll = howManyPagesToSkip * 250;
      scroll(howMuchToScroll);
      cy.byTestId(usePaginationControlsTestIds.LEFT_CONTROL).click().wait(1000);
    }
    mountAndTestLeft(10.20)
    // moundAndTest(0)
    // moundAndTest(1)
    // moundAndTest(2)
    // moundAndTest(3)
    // moundAndTest(4)
    // moundAndTest(5)
  });
});
