import React, { useState } from "react";
import { act, render, waitFor } from "@testing-library/react";

import Component from "./PasswordInput";
import userEvent from "@testing-library/user-event";
import TextStyles from "../Text/Text.module.scss";

const passwordInputRulesDescription = {
  duplication: "MOCK_passwordInputRulesDescription_duplication",
  size: "MOCK_passwordInputRulesDescription_size",
};

jest.unmock("../../../ux/components/elements/icon/icon");

const MOCKED_CREATION_MESSAGES = {
  invalidRules: { duplication: "d", size: "s" },
  rulesTitle: "t",
};

function Wrapper(props: React.ComponentProps<typeof Component>) {
  const [s, ss] = useState(props.value);
  return (
    <Component
      {...(props as any)}
      value={s}
      onChange={(...args: [string, boolean]) => {
        ss(args[0]);
        props.onChange(...args);
      }}
    />
  );
}

function renderScreen(props: React.ComponentProps<typeof Component>) {
  return render(<Wrapper {...props} />);
}

it("Should at least render :)", () => {
  renderScreen({ value: "", mode: "input", onChange: jest.fn() });
});

it.each([
  ["creation", true],
  ["input", false],
] as const)(
  "Should have a validation mode, where it should display all the validations that are being made over the informed password %s",
  (mode, shouldShow) => {
    const changeCb = jest.fn();
    const w = renderScreen(
      mode === "creation"
        ? {
            mode: mode,
            value: "",
            onChange: changeCb,
            messages: MOCKED_CREATION_MESSAGES,
          }
        : { mode: mode, value: "", onChange: changeCb }
    );
    if (shouldShow) expect(w.getByTestId("password-rules"));
    else expect(w.queryByTestId("password-rules")).toBeNull();
  }
);
it("Should reject small passwords < 8", async () => {
  const changeCb = jest.fn();
  const w = renderScreen({
    mode: "creation",
    value: "",
    onChange: changeCb,
    messages: MOCKED_CREATION_MESSAGES,
  });
  await userEvent.type(w.container.querySelector("input")!, "Short", {
    delay: 50,
  });
  expect(changeCb).toHaveBeenLastCalledWith("Short", false);
  expect(
    w.getByText(`- ${passwordInputRulesDescription.size}`).className
  ).toContain(TextStyles.error);
});
it.each([
  ["abc123senha", false],
  ["teste123", false],
  ["mnolol1997", false],
  ["UMASENHASECRETA", true],
  ["1928371281923", true],
  ["Netspaces", true],
])(
  "when %s should reject = %s sequencial numbers or letters ",
  async (pass, isValid) => {
    const changeCb = jest.fn();
    const w = renderScreen({
      mode: "creation",
      value: "",
      onChange: changeCb,
      messages: MOCKED_CREATION_MESSAGES,
    });
    await userEvent.type(w.container.querySelector("input")!, pass, {
      delay: 50,
    });
    expect(changeCb).toHaveBeenLastCalledWith(pass, isValid);
    const expectation = expect(
      w.getByText(`- ${passwordInputRulesDescription.duplication}`).className
    );
    if (isValid) expectation.not.toContain(TextStyles.error);
    else expectation.toContain(TextStyles.error);
  }
);

function createMouseEvent(type: "mousedown" | "mouseup" | "mouseleave") {
  const e = new MouseEvent(type);
  e.initEvent(type, true, true);
  return e;
}
it("Should be able to show password temporarly when mouseenter and hiding onmouseexit", async () => {
  const w = renderScreen({ mode: "input", value: "", onChange: jest.fn() });
  const icon = w.container.querySelector("i")!;
  const input = w.container.querySelector("input")!;

  expect(input.getAttribute("type")).toEqual("password");
  icon.dispatchEvent(createMouseEvent("mousedown"));
  await waitFor(() => expect(input.getAttribute("type")).toEqual(""));
  icon.dispatchEvent(createMouseEvent("mouseup"));
  await waitFor(() => expect(input.getAttribute("type")).toEqual("password"));
});
it("Should be able to validate against a previous password", async () => {
  const changeCb = jest.fn();
  const w = renderScreen({
    mode: "comparision",
    value: "",
    otherPassword: "Senhaigual",
    onChange: changeCb,
    messages: {
      passwordsAreDifferent: "d",
    },
  });
  await userEvent.type(w.container.querySelector("input")!, "Senhaigua", {
    delay: 50,
  });
  expect(changeCb).toHaveBeenLastCalledWith("Senhaigua", false);
  await userEvent.type(w.container.querySelector("input")!, "l", {
    delay: 50,
  });
  expect(changeCb).toHaveBeenLastCalledWith("Senhaigual", true);
});
