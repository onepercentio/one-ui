import Slider from "components/Slider/Slider";
import { SLIDER_TEST_IDS } from "components/Slider/Slider.e2e";
import { mount } from "cypress/react";

it("Should be able to move the slider to the middle", () => {
  cy.viewport(600, 600);
  const PADDING_FROM_DEFAULT_STYLE = 18;
  const PADDING_FROM_TEST_DIV = 100;
  const PROGRESS_WIDTH = 400 - PADDING_FROM_DEFAULT_STYLE * 2;
  function test(
    step: number | undefined,
    expectedValues: number[],
    min: number = 5,
    max: number = 10
  ) {
    const spyForRaw = cy.spy();
    mount(
      <div style={{ backgroundColor: "red", padding: 100 }}>
        <Slider
          onChange={spyForRaw}
          size={48}
          max={max}
          min={min}
          step={step}
        />
      </div>
    );
    cy.byTestId(SLIDER_TEST_IDS.INDICATOR).realMouseDown().wait(500);

    const toTry = [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0];
    for (let step of toTry) {
      cy.get("body")
        .realMouseMove(
          PADDING_FROM_DEFAULT_STYLE +
            PADDING_FROM_TEST_DIV +
            PROGRESS_WIDTH * step,
          0
        )
        .wait(100)
        .then(() => {
          const latestCall = spyForRaw.getCalls().at(-1)!.args[0];
          const expectedValue = expectedValues[1 + toTry.indexOf(step)];
          expect(latestCall).eq(expectedValue);
        });
    }
    cy.get("body").wait(500).realMouseUp();
  }
  test(2, [10, 20, 20, 18, 18, 16, 16, 14, 14, 12, 12, 10, 10], 10, 20);
  test(undefined, [5, 10, 9.5, 9, 8.5, 8, 7.5, 7, 6.5, 6, 5.5, 5]);
  mount(
    <div style={{ backgroundColor: "red", padding: 100 }}>
      <Slider onChange={cy.spy()} size={24} max={3} min={1} step={1} />
    </div>
  );
});
