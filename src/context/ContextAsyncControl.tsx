import React, {
  createContext,
  useContext,
  PropsWithChildren,
  useInsertionEffect,
  useMemo,
  useEffect,
  useState,
} from "react";
import { FunctionMap, useRawAsynControl } from "../hooks/useAsyncControl";

type CB = (...args: any[]) => void;
class Subscriber {
  private sharedCbs: { [id: string]: Function[] } = {};
  private latest: {
    [id: string]: any;
  } = {};

  register<C extends CB>(cbId: string, cb: C) {
    if (!this.sharedCbs[cbId]) this.sharedCbs[cbId] = [];
    this.sharedCbs[cbId].push(cb);
    return (...args: Parameters<C>) => {
      this.latest[cbId] = args;
      for (let cb of this.sharedCbs[cbId]) cb(...args);
    };
  }
  unregister<C extends CB>(cbId: string, cb: C) {
    const cbIdx = this.sharedCbs[cbId].indexOf(cb);
    this.sharedCbs[cbId].splice(cbIdx, 1);
  }
  current(cbId: string) {
    return this.latest[cbId];
  }
}

export type ContextAsyncControlContextShape = {
  [controlId: string]: Subscriber;
};
export const ContextAsyncControlContext =
  createContext<ContextAsyncControlContextShape>(null as any);

export default function ContextAsyncControlProvider({
  children,
}: PropsWithChildren<{}>) {
  return (
    <ContextAsyncControlContext.Provider value={{}}>
      {children}
    </ContextAsyncControlContext.Provider>
  );
}

export function useShareState<E>(controlId: string, stateId: string) {
  const ctx = useContext(ContextAsyncControlContext);
  const [state, setLocalState] = useState<E>(() => {
    if (!ctx[controlId]) ctx[controlId] = new Subscriber();
    const initAs = ctx[controlId].current(stateId)?.[0] as E;
    return initAs;
  });

  const wrappedSetState = useMemo(() => {
    return ctx[controlId].register(stateId, setLocalState);
  }, []);

  useInsertionEffect(
    () => () => {
      ctx[controlId].unregister(stateId, setLocalState);
    },
    []
  );

  return [state, wrappedSetState] as const;
}

export function useContextControl<E, F extends FunctionMap>(
  controlId: string,
  functionsToWrap: F
) {
  const [error, setError] = useShareState<E | Error | undefined>(
    controlId,
    "error"
  );
  const [loading, setLoading] = useShareState<boolean>(controlId, "loading");

  return useRawAsynControl(
    functionsToWrap,
    [error, setError],
    [loading, setLoading]
  );
}
