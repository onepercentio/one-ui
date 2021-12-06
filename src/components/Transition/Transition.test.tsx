import React from "react";
import { render } from "@testing-library/react";

import { InitialImplementation as Component } from "./Transition.stories";
import { WaitTimeout } from "../../__test__/utils";

function renderScreen(props: React.ComponentProps<typeof Component>) {
  return render(<Component {...props} />);
}

it("Should at least render :)", () => {
  renderScreen({ step: 0 });
});

it("Should not break this crazy logic", async () => {
  const wrapper = render(<Component step={0} />);

  wrapper.rerender(<Component step={1} />);
  wrapper.rerender(<Component step={2} />);
  wrapper.rerender(<Component step={3} />);
  wrapper.rerender(<Component step={2} />);
  const [el3WhenGoinBack, el1, el2, el4] = wrapper.getAllByTestId(
    "transition-container"
  ) as HTMLDivElement[];
  expect(wrapper.container.textContent).toMatchSnapshot();
  const event = new Event("animationend");
  event.initEvent("animationend", true, true);
  el1.dispatchEvent(event);
  expect(wrapper.container.textContent).toMatchSnapshot();
  el2.dispatchEvent(event);
  expect(wrapper.container.textContent).toMatchSnapshot();
  el3WhenGoinBack.dispatchEvent(event);
  expect(wrapper.container.textContent).toMatchSnapshot();
});

it("Should lock the current width when transitioning", async () => {
  const wrapper = render(<Component lockTransitionWidth step={0} />);
  const el = wrapper.getByTestId("transition-controller");
  expect(el.style.width).toEqual("");
  wrapper.rerender(<Component lockTransitionWidth step={1} />);
  expect(el.style.width).toEqual("0px");

  const [el1] = wrapper.getAllByTestId(
    "transition-container"
  ) as HTMLDivElement[];
  const event = new Event("animationend");
  event.initEvent("animationend", true, true);
  el1.dispatchEvent(event);
  await WaitTimeout();
  expect(el.style.width).toEqual("");
});
