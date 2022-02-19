import { renderHook } from "@testing-library/react-hooks";
import { act } from "react-dom/test-utils";
import usePooling from "./usePooling";

const mockCb = () => Promise.resolve(true);

beforeEach(() => {
  jest.useFakeTimers();
});
afterEach(() => {
  jest.useRealTimers();
  jest.clearAllTimers();
});

function actAndSync(cb: Function) {
  act(() => {
    cb();
    // This is to advance the timer for the setState
    jest.advanceTimersByTime(100);
  });
}

const renderHookAndSync: typeof renderHook = (cb) => {
  const result = renderHook(cb);
  jest.advanceTimersByTime(100);
  return result;
};

it("Should mount", () => {
  renderHookAndSync(() => usePooling());
});

it("Should be able to create an interval", () => {
  expect(jest.getTimerCount()).toBe(0);
  const {
    result: {
      current: { startPolling },
    },
  } = renderHookAndSync(() => usePooling());
  actAndSync(() => startPolling(mockCb));
  expect(jest.getTimerCount()).toBe(1);

  /** Should clear the old interval */
  actAndSync(() => startPolling(mockCb));
  expect(jest.getTimerCount()).toBe(1);
});

it("Should indicate when the interval shall end", async () => {
  let num = 0;
  const cb = async () => {
    num++;
    return num === 3;
  };
  const { result, rerender } = renderHookAndSync(() => usePooling());
  const { startPolling } = result.current;

  expect(jest.getTimerCount()).toBe(0);
  expect(result.current.isPooling).toBeFalsy();

  actAndSync(() => startPolling(cb));
  expect(jest.getTimerCount()).toBe(1);
  expect(result.current.isPooling).toBeTruthy();

  // First execution
  act(() => {
    jest.advanceTimersByTime(1000);
  });
  expect(jest.getTimerCount()).toBe(1);
  expect(result.current.isPooling).toBeTruthy();

  //Second execution
  act(() => {
    jest.advanceTimersByTime(1000);
  });
  expect(jest.getTimerCount()).toBe(1);
  expect(result.current.isPooling).toBeTruthy();

  //Last execution
  act(() => {
    jest.advanceTimersByTime(1000);
  });

//   expect(jest.getTimerCount()).toBe(0);
//   expect(result.current.isPooling).toBeFalsy();
});

it.each([
  [1000, 5000, 5],
  [500, 10000, 20],
  [1000, 2578, 3],
])(
  "Should end the pooling with error when the pooling of interval %s with max of %s exceeds max executions of %s",
  (poolingInterval, maxTime, expectedExecutionsCount) => {
    const { result } = renderHookAndSync(() =>
      usePooling(poolingInterval, maxTime)
    );
    const { startPolling } = result.current;
    actAndSync(() => startPolling(async () => false));

    for (let i = 1; i < expectedExecutionsCount; i++) {
      act(() => {
        jest.advanceTimersByTime(poolingInterval);
      });
      if (i === expectedExecutionsCount) {
        expect(result.current.isPooling).toBeFalsy();
        expect(result.current.failed).toBeTruthy();
      } else {
        expect(result.current.isPooling).toBeTruthy();
        expect(result.current.failed).toBeFalsy();
      }
    }
  }
);
