import React from "react";
import { act, render } from "@testing-library/react";
import Styles from "./FlowController.module.scss";
import Component from "./FlowController";

function renderScreen(
  props: Omit<React.ComponentProps<typeof Component>, "children">
) {
  return render(
    <Component {...props as any}>
      <div>First step</div>
      <div>Second step</div>
      <div>Third step</div>
    </Component>
  );
}

it("Should at least render :)", () => {
  renderScreen({
    onClose: jest.fn(),
    onBack: jest.fn(),
    step: 0,
    buttons: [
      {
        state: "enabled",
        label: "",
        onClick: jest.fn(),
      },
    ],
  });
});

function renderWithCbs(step: number) {
  const closeCb = jest.fn();
  const backCb = jest.fn();
  const nextCb = jest.fn();
  const wrapper = renderScreen({
    onClose: closeCb,
    onBack: backCb,
    step,
    buttons: [
      {
        state: "enabled",
        label: "",
        onClick: nextCb,
      },
    ],
  });

  return {
    closeCb,
    backCb,
    nextCb,
    wrapper,
  };
}

it("Should call onClose when clicking goBack and step 0", () => {
  const { wrapper, backCb, closeCb } = renderWithCbs(0);
  act(() => wrapper.getByTestId("header-control-back").click());
  expect(backCb).toHaveBeenCalledTimes(0);
  expect(closeCb).toHaveBeenCalledTimes(1);
});
it("Should call onGoBack when clicking the goBack button and step > 0", () => {
  const { wrapper, backCb, closeCb } = renderWithCbs(1);
  act(() => wrapper.getByTestId("header-control-back").click());
  expect(backCb).toHaveBeenCalledTimes(1);
  expect(closeCb).toHaveBeenCalledTimes(0);
});
it("Should call onNext when clicking the footer button", () => {
  const { wrapper, backCb, closeCb, nextCb } = renderWithCbs(1);
  act(() => wrapper.getByRole("button").click());
  expect(backCb).toHaveBeenCalledTimes(0);
  expect(closeCb).toHaveBeenCalledTimes(0);
  expect(nextCb).toHaveBeenCalledTimes(1);
});
it("Should display the selected text on the button", () => {
  const wrapper = renderScreen({
    onClose: jest.fn(),
    step: 0,
    onBack: jest.fn(),
    buttons: [
      {
        label: "MOCKED BUTTON",
        state: "enabled",
        onClick: () => {},
      },
    ],
  });
  expect(wrapper.getByRole("button").textContent).toEqual("MOCKED BUTTON");
});
it("Should be able to enable point of no return, where the goBack action is not displayed anymore, this is indicated by the inexistance of goBack", () => {
  const wrapper = renderScreen({
    onClose: jest.fn(),
    step: 0,
    onBack: jest.fn(),
    buttons: [
      {
        label: "MOCKED BUTTON",
        state: "enabled",
        onClick: () => {},
      },
    ],
  });
  const buttonBack = wrapper.getByTestId("header-control-back");
  expect(buttonBack.classList).not.toContain(Styles.hidden);
  wrapper.rerender(
    <Component
      {...{
        onClose: jest.fn(),
        step: 0,
        onBack: undefined,
        buttons: [
          {
            label: "MOCKED BUTTON",
            state: "enabled",
            onClick: () => {},
          },
        ],
      }}
    >
      <div>First step</div>
      <div>Second step</div>
      <div>Third step</div>
    </Component>
  );
  expect(buttonBack.classList).toContain(Styles.pointOfNoReturn);
});

it("Should show only the current step", () => {
  const wrapper = renderScreen({
    onClose: jest.fn(),
    step: 0,
    onBack: jest.fn(),
    buttons: [
      {
        label: "MOCKED BUTTON",
        state: "enabled",
        onClick: () => {},
      },
    ],
  });
  expect(wrapper.container.textContent).toContain("First step");
  wrapper.rerender(
    <Component
      {...{
        onClose: jest.fn(),
        step: 1,
        onBack: undefined,
        buttons: [
          {
            label: "MOCKED BUTTON",
            state: "enabled",
            onClick: () => {},
          },
        ],
      }}
    >
      <div>First step</div>
      <div>Second step</div>
      <div>Third step</div>
    </Component>
  );
  expect(wrapper.container.textContent).toContain("Second step");
  wrapper.rerender(
    <Component
      {...{
        onClose: jest.fn(),
        step: 2,
        onBack: undefined,
        buttons: [
          {
            label: "MOCKED BUTTON",
            state: "enabled",
            onClick: () => {},
          },
        ],
      }}
    >
      <div>First step</div>
      <div>Second step</div>
      <div>Third step</div>
    </Component>
  );
  expect(wrapper.container.textContent).toContain("Third step");
});
