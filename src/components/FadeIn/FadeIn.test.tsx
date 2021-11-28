import React from "react";
import { render } from "@testing-library/react";

import Styles from "./FadeIn.module.scss";
import Component from "./FadeIn";

it("Should at least render :)", () => {
  render(<Component />);
});

it("Should display previous children when it's removed", () => {
  const wrapper = render(<Component>Previous content</Component>);
  const container = wrapper.getByTestId("fadein_container");
  expect(wrapper.container.textContent).toBe("Previous content");
  expect(container.classList).toContain(Styles.active);
  wrapper.rerender(<Component></Component>);
  expect(wrapper.container.textContent).toBe("Previous content");
  expect(container.classList).not.toContain(Styles.active);
});
