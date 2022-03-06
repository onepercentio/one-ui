import React from "react";
import { render } from "@testing-library/react";

import Component, { InputTestIds } from "./Input";

it("Should at least render :)", () => {
  render(<Component />);
});

it("Should be able to show errors based on prop", () => {
  const w = render(<Component />);
  expect(w.queryByTestId(InputTestIds.ERROR)).toBeNull();
  w.rerender(<Component error="Some obnoxious error" />);
  expect(w.getByTestId(InputTestIds.ERROR).textContent).toEqual(
    "Some obnoxious error"
  );
});

describe("Disclaimer", () => {
  it("Should not show disclaimer if not provided", () => {
    const { queryByTestId } = render(<Component />);
    const disclaimerEl = queryByTestId(InputTestIds.DISCLAIMER);
    expect(disclaimerEl).toBeNull();
  });
  it("Should show the disclaimer when there is no error", () => {
    const exampleDisclaimer = "DISCLAIMER";
    const exampleError = "ERROR";
    const { getByTestId, queryByTestId, rerender } = render(
      <Component disclaimer={exampleDisclaimer} />
    );
    getByTestId(InputTestIds.DISCLAIMER);
    expect(queryByTestId(InputTestIds.ERROR)).toBeNull();

    rerender(<Component disclaimer={exampleDisclaimer} error={exampleError} />);
    getByTestId(InputTestIds.ERROR);
    expect(queryByTestId(InputTestIds.DISCLAIMER)).toBeNull();
  });
});
