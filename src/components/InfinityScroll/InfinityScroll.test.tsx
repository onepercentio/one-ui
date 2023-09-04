import React, { createRef } from "react";
import { render } from "@testing-library/react";

import _InfinityScroll, { keys, shouldIncrementPage } from "./InfinityScroll";
import { act } from "@testing-library/react";

HTMLElement.prototype.scrollTo = jest.fn();
Object.defineProperty(HTMLElement.prototype, "offsetLeft", {
  set: function (val) {
    this._offsetLeft = val;
  },
  get: function () {
    return this._offsetLeft;
  },
});
const elements = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
];
it("Should be able to decide when to emulate the page recycling", () => {
  const wrapper = render(
    <_InfinityScroll ref={createRef()} items={elements} pageSize={3} />
  );

  expect(wrapper.container.textContent).toEqual("def123456");
});

it.each([
  [0, "234123412"],
  [1, "123412341"],
])(
  "Should be able to show uneved number of items",
  (initialPage, expectation) => {
    const elements = ["1", "2", "3", "4"];
    const wrapper = render(
      <_InfinityScroll
        ref={createRef()}
        items={elements}
        pageSize={3}
        initialPage={initialPage}
      />
    );

    expect(wrapper.container.textContent).toEqual(expectation);
  }
);

it.each([
  [200, 0, 200, 1],
  [0, 0, 200, -1],
  [100, 0, 200, 0], // This happens when the change on page is executed
])(
  "Should be able to decide when to go to another page",
  (
    howMuchTheParentScrolled,
    prevSectionPosition,
    nextSectionPosition,
    expectationForPageIncrease
  ) => {
    expect(
      shouldIncrementPage(
        howMuchTheParentScrolled,
        prevSectionPosition,
        nextSectionPosition
      )
    ).toEqual(expectationForPageIncrease);
  }
);

it("Should not infinitize if the number of items can be displayed on single section", () => {
  const elements = ["1", "2", "3"];
  const { container } = render(
    <_InfinityScroll
      ref={createRef()}
      items={elements}
      pageSize={3}
      initialPage={1}
    />
  );
  expect(container.textContent).toEqual("123");
});

describe("BugFixing", () => {
  it("Should be able to infinitize after single page", () => {
    const event = new Event("scroll");
    event.initEvent("scroll", true, true);
    const elements = ["1", "2", "3"];
    const moreElements = ["1", "2", "3", "4"];
    const { rerender, container, getByTestId } = render(
      <_InfinityScroll ref={createRef()} items={elements} pageSize={3} />
    );
    expect(container.textContent).toEqual("123");
    rerender(
      <_InfinityScroll ref={createRef()} items={moreElements} pageSize={3} />
    );
    expect(container.textContent).toEqual("234123412");
    const parent = getByTestId("infinity-parent");
    const prev = getByTestId("infinity-prev");
    const curr = getByTestId("infinity-curr");
    const next = getByTestId("infinity-next");

    (prev as any).offsetLeft = 0;
    (curr as any).offsetLeft = 100;
    (next as any).offsetLeft = 200;
    (parent as any).scrollLeft = 200;

    act(() => {
      parent.dispatchEvent(event);
    });
    expect(container.textContent).toEqual("123412341");
  });
  it("Should request next pages correctly", () => {
    const event = new Event("scroll");
    event.initEvent("scroll", true, true);
    const elements = ["1", "2", "3", "4"];
    const { getByTestId, container } = render(
      <_InfinityScroll
        ref={createRef()}
        items={elements}
        pageSize={3}
        initialPage={1}
      />
    );
    expect(container.textContent).toEqual("123412341");
    const parent = getByTestId("infinity-parent");
    (parent as any).scrollLeft = 200;

    function goToNextPage() {
      const prev = getByTestId("infinity-prev");
      const curr = getByTestId("infinity-curr");
      const next = getByTestId("infinity-next");

      (prev as any).offsetLeft = 0;
      (curr as any).offsetLeft = 100;
      (next as any).offsetLeft = 200;
      parent.dispatchEvent(event);
    }

    act(() => {
      goToNextPage();
    });
    expect(container.textContent).toEqual("412341234");

    act(() => {
      goToNextPage();
    });
    expect(container.textContent).toEqual("341234123");

    act(() => {
      goToNextPage();
    });
    expect(container.textContent).toEqual("234123412");

    act(() => {
      goToNextPage();
    });
    expect(container.textContent).toEqual("123412341");

    act(() => {
      goToNextPage();
    });
    expect(container.textContent).toEqual("412341234");

    act(() => {
      goToNextPage();
    });
    expect(container.textContent).toEqual("341234123");
  });
  it("Should request prev pages correctly", () => {
    const event = new Event("scroll");
    event.initEvent("scroll", true, true);
    const elements = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
    const { getByTestId, container } = render(
      <_InfinityScroll
        ref={createRef()}
        items={elements}
        pageSize={3}
        initialPage={1}
      />
    );
    expect(container.textContent).toEqual("123456789");
    const parent = getByTestId("infinity-parent");
    (parent as any).scrollLeft = 0;

    function goToPrevPage() {
      const prev = getByTestId("infinity-prev");
      const curr = getByTestId("infinity-curr");
      const next = getByTestId("infinity-next");

      (prev as any).offsetLeft = 0;
      (curr as any).offsetLeft = 100;
      (next as any).offsetLeft = 200;
      parent.dispatchEvent(event);
    }

    act(() => {
      goToPrevPage();
    });
    expect(container.textContent).toEqual("789123456");

    act(() => {
      goToPrevPage();
    });
    expect(container.textContent).toEqual("456789123");

    act(() => {
      goToPrevPage();
    });
    expect(container.textContent).toEqual("123456789");

    act(() => {
      goToPrevPage();
    });
    expect(container.textContent).toEqual("789123456");
  });
});

describe("Optimization", () => {
  it("Should slide the keys definitions to reuse divs", () => {
    expect(keys(0)).toEqual([2, 1, 0].map((a) => `step_${a}`));
    expect(keys(1)).toEqual([0, 2, 1].map((a) => `step_${a}`));
    expect(keys(2)).toEqual([1, 0, 2].map((a) => `step_${a}`));
    expect(keys(3)).toEqual([2, 1, 0].map((a) => `step_${a}`));
    expect(keys(4)).toEqual([0, 2, 1].map((a) => `step_${a}`));
  });
});
