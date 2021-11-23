import React from "react";
import { render } from "@testing-library/react";

import Component from "./Input";

it("Should at least render :)", () => {
  render(<Component />);
});

it("Should be able to show errors based on prop", () => {
  const w = render(<Component />);
  expect(w.queryByTestId("error-label")).toBeNull();
  w.rerender(<Component error="Some obnoxious error" />);
  expect(w.getByTestId("error-label").textContent).toEqual(
    "Some obnoxious error"
  );
});
