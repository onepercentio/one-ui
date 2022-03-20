import React from "react";
import { render } from "@testing-library/react";

import Component from "./Freeze";

it("Should mantain the children when the children assumes empty value", () => {
  const { container, rerender } = render(
    <Component>Some condition that assumes in a moment</Component>
  );
  expect(container.textContent).toEqual("Some condition that assumes in a moment");

  rerender(<Component></Component>);
  expect(container.textContent).toEqual("Some condition that assumes in a moment");
});
