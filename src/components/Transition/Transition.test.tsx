import React from "react";
import { render } from "@testing-library/react";

import { InitialImplementation as Component } from "./Transition.stories";

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
  const [
    el3WhenGoinBack,
    el1,
    el2,
    el4,
  ] = wrapper.getAllByTestId("transition-container") as HTMLDivElement[];
  const event = new Event("animationend");
  expect(wrapper.container.textContent).toMatchSnapshot();
  event.initEvent("animationend", true, true)
  el1.dispatchEvent(event);
  expect(wrapper.container.textContent).toMatchSnapshot();
  el2.dispatchEvent(event);
  expect(wrapper.container.textContent).toMatchSnapshot();
  el3WhenGoinBack.dispatchEvent(event);
  expect(wrapper.container.textContent).toMatchSnapshot();
});
