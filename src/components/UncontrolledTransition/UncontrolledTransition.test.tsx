import React, { createRef, ElementRef } from "react";
import { act, render } from "@testing-library/react";

import Component from "./UncontrolledTransition";

function renderScreen(props: React.ComponentProps<typeof Component>) {
  return render(<Component {...props} />);
}

const spyOnTransitionContructor = jest.spyOn(
  require("../Transition"),
  "default"
);

it("Should transition only when the child changes", async () => {
  const ref: React.MutableRefObject<ElementRef<typeof Component>> = {
    current: null as any,
  };
  const event = new Event("animationend");
  event.initEvent("animationend", true, true);

  const wrapper = render(
    <Component ref={ref}>
      <h1 key="1">First step</h1>
    </Component>
  );

  expect(wrapper.container.textContent).toEqual("First step");

  wrapper.rerender(
    <Component ref={ref}>
      <h1 key="2">Second step</h1>
    </Component>
  );

  expect(wrapper.container.textContent).toEqual("First stepSecond step");

  wrapper.rerender(
    <Component ref={ref}>
      <h1 key="2">Second step</h1>
    </Component>
  );

  expect(wrapper.container.textContent).toEqual("First stepSecond step");

  const [firstStepEl] = wrapper.getAllByTestId("transition-container");
  firstStepEl.dispatchEvent(event);

  expect(wrapper.container.textContent).toEqual("Second step");
  wrapper.rerender(
    <Component ref={ref}>
      <h1 key="3">Third step</h1>
    </Component>
  );

  expect(spyOnTransitionContructor).toHaveBeenLastCalledWith(
    expect.objectContaining({
      step: 1,
      children: expect.arrayContaining([
        expect.objectContaining({ key: "2" }),
        expect.objectContaining({ key: "3" }),
      ]),
    }),
    expect.anything()
  );
  expect(wrapper.container.textContent).toEqual("Second stepThird step");

  const [secondStepEl] = wrapper.getAllByTestId("transition-container");
  secondStepEl.dispatchEvent(event);

  expect(wrapper.container.textContent).toEqual("Third step");

  act(() => {
    ref.current.setOrientation("backward");
  });

  wrapper.rerender(
    <Component ref={ref}>
      <h1 key="2">Second step</h1>
    </Component>
  );

  expect(wrapper.container.textContent).toEqual("Second stepThird step");

  const [secondStepEl2] = wrapper.getAllByTestId("transition-container");
  secondStepEl2.dispatchEvent(event);

  expect(wrapper.container.textContent).toEqual("Second step");
});
