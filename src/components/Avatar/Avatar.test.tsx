import React from "react";
import { render } from "@testing-library/react";

import { InitialImplementation as Component } from "./Avatar.stories";

function renderScreen(props: React.ComponentProps<typeof Component>) {
  return render(<Component {...props} />);
}

it("Should show the image if provided", () => {
  const MOCK_IMG = `data:base64//somebase64`;
  const MOCK_NAME = "Francesco Silva";

  const { container } = renderScreen({
    name: MOCK_NAME,
    imgSrc: MOCK_IMG,
  });

  expect(container.textContent).toBe("");
  expect(container.querySelector("img")!.getAttribute("alt")).toEqual(
    MOCK_NAME
  );
});
it.each([
  ["Murilo", "M"],
  ["Murilo Oliveira de Araujo", "MA"],
  ["Murilo Araujo", "MA"],
  ["Francesco Espacio ", "FE"],
  ["   This Is the Way  ", "TW"],
  ["Mano Mano", "MM"],
  ["Single", "S"],
])("Should show the initials for the name %s as %s", (name, expectation) => {
  const { container } = renderScreen({
    name: name,
  });
  expect(container.textContent).toEqual(expectation);
});
