import React, {
  createRef,
  ElementRef,
  useEffect,
  useLayoutEffect,
} from "react";
import { act, render } from "@testing-library/react";

import Component from "./UncontrolledTransition";

function renderScreen(props: React.ComponentProps<typeof Component>) {
  return render(<Component {...props} />);
}

const spyOnTransitionContructor = jest.spyOn(
  require("../Transition"),
  "default"
);
describe("Bugfix", () => {
  it("Should render correctly when multiple backwards", () => {
    const ref: React.MutableRefObject<ElementRef<typeof Component>> = {
      current: null as any,
    };
    const event = new Event("animationend");
    event.initEvent("animationend", true, true);

    function BugWrapper({
      shouldEffectBackwards,
      txt,
    }: {
      txt: string;
      shouldEffectBackwards: boolean;
    }) {
      useLayoutEffect(() => {
        if (shouldEffectBackwards) ref.current.setOrientation("backward");
      }, [shouldEffectBackwards, txt]);
      return (
        <Component ref={ref}>
          <h1 key={txt}>{txt}</h1>
        </Component>
      );
    }

    const wrapper = render(
      <BugWrapper shouldEffectBackwards={false} txt="1" />
    );
    wrapper.rerender(<BugWrapper shouldEffectBackwards txt="0" />);
    expect(wrapper.container.textContent).toEqual("01");
    function finishFirst() {
      const [firstStepEl] = wrapper.getAllByTestId("transition-container");
      firstStepEl.dispatchEvent(event);
    }
    finishFirst();
    expect(wrapper.container.textContent).toEqual("0");

    wrapper.rerender(<BugWrapper shouldEffectBackwards txt="-1" />);
    expect(wrapper.container.textContent).toEqual("-10");
    finishFirst();
    expect(wrapper.container.textContent).toEqual("-1");
  });
});

it("Should work with backwards", async () => {
  const ref: React.MutableRefObject<ElementRef<typeof Component>> = {
    current: null as any,
  };

  function BugWrapper({
    shouldEffectBackwards,
    txt,
  }: {
    txt: string;
    shouldEffectBackwards: boolean;
  }) {
    useLayoutEffect(() => {
      if (shouldEffectBackwards) ref.current.setOrientation("backward");
    }, [shouldEffectBackwards]);
    return (
      <Component ref={ref}>
        <h1 key={txt}>{txt}</h1>
      </Component>
    );
  }

  const wrapper = render(
    <BugWrapper shouldEffectBackwards={false} txt="First step" />
  );

  wrapper.rerender(<BugWrapper shouldEffectBackwards txt="Zero" />);
  expect(wrapper.container.textContent).toEqual("ZeroFirst step");

  wrapper.rerender(
    <BugWrapper shouldEffectBackwards={false} txt="Third screen" />
  );
  // This is a bug that will be fixed in the future
  // expect(wrapper.container.textContent).toEqual("ZeroFirst stepThird screen");
});

it("Should transition only when the child changes", async () => {
  const ref: React.MutableRefObject<ElementRef<typeof Component>> = {
    current: null as any,
  };
  const event = new Event("animationend");
  event.initEvent("animationend", true, true);

  const wrapper = render(
    <Component ref={ref}>
      <h1 key="1">First step</h1>
    </Component>
  );

  expect(wrapper.container.textContent).toEqual("First step");

  wrapper.rerender(
    <Component ref={ref}>
      <h1 key="2">Second step</h1>
    </Component>
  );

  expect(wrapper.container.textContent).toEqual("First stepSecond step");

  wrapper.rerender(
    <Component ref={ref}>
      <h1 key="2">Second step</h1>
    </Component>
  );

  expect(wrapper.container.textContent).toEqual("First stepSecond step");

  const [firstStepEl] = wrapper.getAllByTestId("transition-container");
  firstStepEl.dispatchEvent(event);

  expect(wrapper.container.textContent).toEqual("Second step");
  wrapper.rerender(
    <Component ref={ref}>
      <h1 key="3">Third step</h1>
    </Component>
  );

  expect(spyOnTransitionContructor).toHaveBeenLastCalledWith(
    expect.objectContaining({
      step: 1,
      children: expect.arrayContaining([
        expect.objectContaining({ key: "2" }),
        expect.objectContaining({ key: "3" }),
      ]),
    }),
    expect.anything()
  );
  expect(wrapper.container.textContent).toEqual("Second stepThird step");

  const [secondStepEl] = wrapper.getAllByTestId("transition-container");
  secondStepEl.dispatchEvent(event);

  expect(wrapper.container.textContent).toEqual("Third step");

  act(() => {
    ref.current.setOrientation("backward");
  });

  wrapper.rerender(
    <Component ref={ref}>
      <h1 key="2">Second step</h1>
    </Component>
  );

  expect(wrapper.container.textContent).toEqual("Second stepThird step");

  const [secondStepEl2] = wrapper.getAllByTestId("transition-container");
  secondStepEl2.dispatchEvent(event);

  expect(wrapper.container.textContent).toEqual("Second step");
});
