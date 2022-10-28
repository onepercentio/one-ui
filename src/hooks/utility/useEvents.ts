import { useRef } from "react";

/**
 * This hook allows for easier declaration of events and unsubscribers
 */
export default function useEvents<
  EN extends string,
  E extends { [k in EN]: any[] }
>() {
  const _eventSUbscriptionsMap = useRef<
    {
      [k in EN]?: ((...args: E[k]) => void)[];
    }
  >({});
  const subscriber = <X extends EN>(e: X, cb: (...args: E[X]) => void) => {
    if (!_eventSUbscriptionsMap.current[e])
      _eventSUbscriptionsMap.current[e] = [];
    _eventSUbscriptionsMap.current[e]!.push(cb);
    return () => {
      const arr = _eventSUbscriptionsMap.current[e]!;
      arr.splice(arr.indexOf(cb), 1);
    };
  };
  const dispatcher = <X extends EN>(eventName: X, ...args: E[X]) => {
    const subscriptions = _eventSUbscriptionsMap.current[eventName] || [];

    subscriptions.forEach((cb) => cb(...args));
  };
  return {
    subscriber,
    dispatcher,
  };
}
