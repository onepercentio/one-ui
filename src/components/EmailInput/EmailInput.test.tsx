import React, { ChangeEvent, useState } from "react";
import { act, render } from "@testing-library/react";

import Component from "./EmailInput";
import userEvent from "@testing-library/user-event";

function Wrapper(props: React.ComponentProps<typeof Component>) {
  const [s, ss] = useState("");
  function _onChange(v: string, valid: boolean) {
    ss(v);
    props.onChange(v, valid);
  }
  return <Component {...props} value={s} onChange={_onChange} />;
}

function renderScreen(props: React.ComponentProps<typeof Component>) {
  return render(<Wrapper {...props} />);
}

it("Should at least render :)", () => {
  renderScreen({
    onChange: jest.fn(),
    value: "",
    messages: { invalidEmail: "MOCK_INVALID_EMAIL" },
  });
});

const MOCKED_ERROR_MESSAGE = "MOCK_INVALID_EMAIL";

it("Should display error when unfocusing and the email is invalid", async () => {
  const w = renderScreen({
    onChange: jest.fn(),
    value: "",
    messages: { invalidEmail: "MOCK_INVALID_EMAIL" },
  });
  const input = w.getByRole("textbox") as HTMLInputElement;
  await userEvent.type(input, "muritavo@gmail", { delay: 50 });
  expect(w.container.textContent).not.toContain(MOCKED_ERROR_MESSAGE);
  act(() => input.blur());
  expect(w.container.textContent).toContain(MOCKED_ERROR_MESSAGE);
  await userEvent.type(input, ".com", { delay: 50 });
  expect(w.container.textContent).not.toContain(MOCKED_ERROR_MESSAGE);
  act(() => input.blur());
  expect(w.container.textContent).not.toContain(MOCKED_ERROR_MESSAGE);
});
