import React from "react";
import { mount } from "cypress/react";
import * as AllExamples from "../../../../src/components/Countdown/Countdown.stories";
import { InitialImplementation } from "../../../../src/components/Countdown/Countdown.stories";
import { CountdownTextModel } from "../../../../src/components/Countdown/Countdown";

it("All examples mount at least", () => {
  const stories = Object.entries(AllExamples).filter(
    ([name]) => name !== "default"
  );
  stories.forEach(([_, Story]) => {
    const Component = Story as React.ComponentType<any> & { args?: any };
    mount(<Component {...Component.args} />);
    cy.wait(500);
  });
});

describe("Business rules", () => {
  it("renders with the initial formatted time", () => {
    // 1 hour, 1 minute, 1 second = 3661000 ms
    // Formatted: 01:01:01
    mount(<InitialImplementation timeRemaining={3661000} />);
    cy.contains("01:01:01");
  });

  it("decrements time normally", () => {
    cy.clock();
    mount(<InitialImplementation timeRemaining={10000} />); // 10 seconds
    cy.contains("00:00:10");
    cy.tick(1000);
    cy.contains("00:00:09");
  });

  it("Should be able to indicate which fields should be shown", () => {
    cy.clock();
    mount(<InitialImplementation timeRemaining={1000 * 60 * 2} />);
    // 2 minutes = 00:02:00
    cy.contains("02:00");
    cy.get("body").should("contain.text", "00:");

    // Advance 2 seconds -> 00:01:58
    cy.tick(2000);
    cy.contains("01:58");

    mount(
      <InitialImplementation
        timeRemaining={1000 * 60 * 2}
        options={{
          hours: false,
        }}
      />
    );
    // 02:00 but hours hidden -> 02:00 (mm:ss)
    cy.contains("02:00");
    cy.get("body").should("not.contain.text", "00:");
  });

  it("Should render SHORT model correctly", () => {
    mount(
      <InitialImplementation
        timeRemaining={1000 * 60 * 60 * 1 + 1000 * 60 * 30 + 1000 * 15} // 1h 30m 15s
        model={CountdownTextModel.SHORT}
      />
    );
    // IntegerFormatter uses minimumIntegerDigits: 2
    // 1h -> 01h, 30m -> 30m, 15s -> 15s
    cy.contains("01h");
    cy.contains("30m");
    cy.contains("15s");

    // Test with options.hours = false
    mount(
      <InitialImplementation
        timeRemaining={1000 * 60 * 60 * 1 + 1000 * 60 * 30 + 1000 * 15}
        model={CountdownTextModel.SHORT}
        options={{ hours: false }}
      />
    );
    cy.get("body").should("not.contain.text", "h");
    cy.contains("30m"); // 1h 30m = 90m (since 1h * 60 + 30 = 90)
    cy.contains("15s");
  });

  it("Should handle zero duration immediately", () => {
    const onFinishSpy = cy.spy().as("onFinishSpy");
    mount(<InitialImplementation timeRemaining={0} onFinish={onFinishSpy} />);
    cy.contains("00:00:00");
    cy.get("@onFinishSpy").should("have.been.called");
  });

  it("Should countdown and call onFinish", () => {
    cy.clock();
    const onFinishSpy = cy.spy().as("onFinishSpy");

    // 5 seconds remaining
    mount(<InitialImplementation timeRemaining={5000} onFinish={onFinishSpy} />);

    cy.contains("00:00:05");

    // Advance 2 seconds
    cy.tick(2000);
    cy.contains("00:00:03");

    // Advance 3 more seconds (total 5) - should hit 0
    cy.tick(3000);
    cy.contains("00:00:00");

    // Check if onFinish was called
    cy.get("@onFinishSpy").should("have.been.called");
  });

  it("handles throttling/time-jumps correctly (The Fix)", () => {
    // This test simulates the browser tab lagging.
    // We want to prove that if real time advances by 30s,
    // the timer updates by 30s regardless of tick count.

    const startTime = 1000000000000;
    cy.clock(startTime);

    // Render with 60s remaining
    mount(<InitialImplementation timeRemaining={60000} />);
    cy.contains("00:01:00");

    // Simulate time passing (30s)
    // Note: In Cypress cy.tick() triggers interval execution for each step.
    // However, if the component calculates remainder based on (EndTime - Date.now()),
    // it will be correct even if we jump.
    cy.tick(30000);

    // 60s - 30s = 30s
    cy.contains("00:00:30");
  });
});
