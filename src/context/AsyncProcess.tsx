import React, { useMemo } from "react";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
} from "react";
import useEvents from "../hooks/utility/useEvents";

const AsyncProcessContext = createContext<{
  _subscriber: ReturnType<typeof useEvents>["subscriber"];
  _wrappedFunctions: {
    [k in keyof OnepercentUtility.AsyncQueue.Processes]: (
      ...args: OnepercentUtility.AsyncQueue.Processes[k]
    ) => Promise<void>;
  };
}>(null as any);

type PersistedIdentifier = string;

export default function AsyncProcessProvider({
  children,
  triggers,
  persistence,
}: PropsWithChildren<{
  /** Functions that will be provided to those that use the async process */
  triggers: {
    [k in keyof OnepercentUtility.AsyncQueue.Processes]: (
      ...args: OnepercentUtility.AsyncQueue.Processes[k]
    ) => Promise<void>;
  };
  /** This will persist the data required for restoring the async processes when required */
  persistence: {
    write: <K extends keyof OnepercentUtility.AsyncQueue.Processes>(
      k: K,
      ...args: OnepercentUtility.AsyncQueue.Processes[K]
    ) => PersistedIdentifier;
    remove: (id: PersistedIdentifier) => void;
    recover: () => [PersistedIdentifier, Promise<void>][];
  };
}>) {
  const { subscriber, dispatcher } = useEvents();

  const wrappedFunctions = useMemo(() => {
    return Object.keys(triggers).reduce(
      (r, k) => ({
        ...r,
        [k]: (
          ...args: OnepercentUtility.AsyncQueue.Processes[keyof OnepercentUtility.AsyncQueue.Processes]
        ) => {
          let persisted = persistence.write(k as any, ...args);
          return (triggers as any)[k as any](...args).finally(() => {
            persistence.remove(persisted);
            dispatcher(k as any);
          });
        },
      }),
      {} as typeof triggers
    );
  }, []);

  useEffect(() => {
    const recoveries = persistence.recover();
    for (let [recoveryId, recoveryProcess] of recoveries)
      recoveryProcess.finally(() => {
        persistence.remove(recoveryId);
      });
  }, []);

  return (
    <AsyncProcessContext.Provider
      value={{ _subscriber: subscriber, _wrappedFunctions: wrappedFunctions }}
    >
      {children}
    </AsyncProcessContext.Provider>
  );
}

export function useAsyncProcess(): {
  [k in keyof OnepercentUtility.AsyncQueue.Processes]: (
    ...args: OnepercentUtility.AsyncQueue.Processes[k]
  ) => Promise<void>;
} & {
  on: (
    k: keyof OnepercentUtility.AsyncQueue.Processes,
    whatToDo: () => void
  ) => void;
} {
  const { _subscriber: subscriber, _wrappedFunctions } =
    useContext(AsyncProcessContext);
  const subscriptions = useRef<Function[]>([]);

  useEffect(
    () => () => {
      for (let unsubscribe of subscriptions.current) unsubscribe();
    },
    []
  );

  return {
    on: (k, whatToDo) => {
      subscriptions.current.push(subscriber(k, whatToDo));
    },
    ..._wrappedFunctions,
  };
}
