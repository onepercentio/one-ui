import React, {
  createContext,
  PropsWithChildren,
  ReactElement,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  countRegistration,
  securePromise,
} from "./AsyncProcessQueue.development";

export enum AsyncQueueErrors {
  RECOVERY_IS_NOT_BEING_CALLED = `A recovery is not set for this call. If the user reloads the page, this process will not return to the async list`,
}

type ReactElementWithState = ReactElement & {
  status: "loading" | "succeded" | "failed";
};
type ContextShape = {
  targetElRef: RefObject<HTMLDivElement>;
  pendingTransactions: ReturnType<typeof useCounter>;
  UIs: ReactElementWithState[];
  setUIs: (
    updater: (previous: ReactElementWithState[]) => ReactElementWithState[]
  ) => void;
  watchPromise: <T extends keyof OnepercentUtility.AsyncQueue.UIModels>(
    promise: Promise<any>,
    retryFunc: () => Promise<any>,
    uiType: T,
    ...uiArgs: OnepercentUtility.AsyncQueue.UIModels[T]
  ) => void;
  recoveries: {
    [k in keyof OnepercentUtility.AsyncQueue.RecoveryTypes]: {
      write: (...args: OnepercentUtility.AsyncQueue.RecoveryTypes[k]) => void;
      clear: (...args: OnepercentUtility.AsyncQueue.RecoveryTypes[k]) => void;
    };
  };
};
const Context = createContext<ContextShape>(null as any);

function useCounter() {
  const [count, setCounter] = useState(0);

  return {
    count,
    setCounter,
    increment: () => setCounter((prev) => prev + 1),
    decrement: () => setCounter((prev) => prev - 1),
    reset: () => setCounter(0),
  };
}

/**
 * This propagates the utilitary functions
 */
export function AsyncProcessQueueProvider<
  R extends OnepercentUtility.AsyncQueue.RecoveryTypes = OnepercentUtility.AsyncQueue.RecoveryTypes,
  T extends keyof OnepercentUtility.AsyncQueue.UIModels = keyof OnepercentUtility.AsyncQueue.UIModels
>({
  children,
  recoveries,
  uiFactory,
}: PropsWithChildren<{
  recoveries: {
    [k in keyof R]: {
      write: (...args: R[k]) => void;
      clear: (...args: R[k]) => void;
      recover: () => [
        promiseToWaitFor: Promise<any>,
        promiseRetryFunction: () => Promise<any>,
        uiType: T,
        ...uiArgs: OnepercentUtility.AsyncQueue.UIModels[T]
      ][];
    };
  };
  uiFactory: (
    type: keyof OnepercentUtility.AsyncQueue.UIModels
  ) => UIStateFactory;
}>) {
  const targetRef = useRef<HTMLDivElement>(null);
  const pendingCounter = useCounter();
  const [UIs, setUIs] = useState<ReactElementWithState[]>([]);
  if (process.env.NODE_ENV === "development")
    useLayoutEffect(() => {
      if (!targetRef.current)
        throw new Error(
          `The target for the async elements to transition to is not defined, please review your UI hierarchy`
        );
    }, []);

  const _recoveries =
    process.env.NODE_ENV === "development"
      ? Object.entries(recoveries).reduce(
          (r, [k, v]) => ({
            ...r,
            [k]: {
              ...v,
              write: (...args: any[]) => {
                countRegistration();
                return v.write(...args);
              },
            },
          }),
          {}
        )
      : recoveries;

  const watchPromise = useCallback<ContextShape["watchPromise"]>(
    (promise, retry, uiType, ...uiParams) => {
      const Factory = uiFactory(uiType);
      const LoadingUIInstance = {
        ...Factory("loading"),
        status: "loading",
      } as ReactElementWithState;

      if (process.env.NODE_ENV === "development" && !LoadingUIInstance.key)
        throw new Error(
          `The UI generate for the async process should have a key`
        );

      setUIs((prev) => [
        ...prev.filter((a) => a.key !== LoadingUIInstance.key),
        LoadingUIInstance,
      ]);
      promise.then((result) => {
        // Write success UI
        setUIs((prev) =>
          prev.map((a) =>
            a === LoadingUIInstance
              ? { ...Factory("succeded"), status: "succeded" }
              : a
          )
        );

        return result;
      });
      promise.catch((error) => {
        const UIInstance = Factory(
          "failed",
          error,
          () => setUIs((prev) => prev.filter((ui) => ui !== UIInstance)),
          () => watchPromise(retry(), retry, uiType, ...uiParams)
        ) as ReactElementWithState;
        // Write success UI
        setUIs((prev) =>
          prev.map((a) =>
            a === LoadingUIInstance ? { ...UIInstance, status: "failed" } : a
          )
        );

        throw error;
      });
      return promise;
    },
    []
  );

  useEffect(() => {
    for (let recovery in recoveries) {
      const recoveredProcesses = recoveries[recovery].recover();
      for (let [promise, ...recoveredProcess] of recoveredProcesses) {
        watchPromise(
          promise.catch(() => {}),
          ...recoveredProcess
        );
      }
    }
  }, []);

  return (
    <Context.Provider
      value={{
        targetElRef: targetRef,
        pendingTransactions: pendingCounter,
        watchPromise,
        setUIs,
        UIs,
        recoveries: _recoveries,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useAsyncProcessQueueContext() {
  return useContext(Context);
}

type AsyncProcessStatuses = "loading" | "succeded" | "failed";

export interface UIStateFactory {
  (
    status: AsyncProcessStatuses,
    error?: Error,
    dismiss?: () => void,
    retry?: () => void
  ): ReactElement;
}

function calculateCenter(el: HTMLElement) {
  const boundsOnViewport = el.getBoundingClientRect();
  return {
    x: boundsOnViewport.x + boundsOnViewport.width / 2,
    y: boundsOnViewport.y + boundsOnViewport.height / 2,
  };
}

/** This exposes the recovery registration functions available for abtract types of calls */
export function useRecoveries<
  R extends OnepercentUtility.AsyncQueue.RecoveryTypes = OnepercentUtility.AsyncQueue.RecoveryTypes
>(): {
  [K in keyof R]: {
    write(...args: R[K]): void;
    clear(...args: R[K]): void;
  };
} {
  return useAsyncProcessQueueContext().recoveries as any;
}

type Params<
  U extends keyof OnepercentUtility.AsyncQueue.UIModels = keyof OnepercentUtility.AsyncQueue.UIModels
> = [U, ...OnepercentUtility.AsyncQueue.UIModels[U]];

/**
 * This function wraps other async functions and decides when the ongoing promise should be put on the queue or not
 */
export function useAsyncProcessQueue<
  T extends {
    [k: string]: (...args: any[]) => Promise<any>;
  }
>(
  functionsToQueue: T,
  UIParamsFactory: <F extends keyof T>(functionName: F) => Params
): T & {
  elToTransitionToQueue: RefObject<HTMLDivElement>;
  /**
   * Function that wraps the current running actions and animates to the target queue element
   */
  wrapQueue: () => void;
} {
  const loadingRef = useRef<Function | null>(null);
  const wrapped = useRef(false);
  const elToTransitionToQueue = useRef<HTMLDivElement>(null);
  const { targetElRef: targetEl, watchPromise } = useContext(Context);
  const initialCenter =
    useRef<{
      center: ReturnType<typeof calculateCenter>;
      dimensions: [number, number];
    }>();
  useEffect(() => {
    initialCenter.current = {
      center: calculateCenter(targetEl.current!),
      dimensions: [
        targetEl.current!.clientWidth,
        targetEl.current!.clientHeight,
      ],
    };
  }, []);
  const wrapQueue = useCallback(() => {
    if (wrapped.current || !loadingRef.current) return;
    const wrapUI = loadingRef.current;
    wrapped.current = true;

    const clone = elToTransitionToQueue.current!.cloneNode(true) as HTMLElement;
    const currPositionOnViewport =
      elToTransitionToQueue.current!.getBoundingClientRect();
    const currPosCenter = calculateCenter(elToTransitionToQueue.current!);
    const targetCenter = targetEl.current
      ? calculateCenter(targetEl.current!)
      : initialCenter.current!.center;
    clone.style.position = "fixed";
    clone.style.top = `${currPositionOnViewport.top}px`;
    clone.style.left = `${currPositionOnViewport.left}px`;
    clone.style.width = `${currPositionOnViewport.width}px`;
    clone.style.height = `${currPositionOnViewport.height}px`;
    clone.style.transition = `transform 250ms  ease-out, opacity 250ms ease-in`;
    clone.style.opacity = "1";
    clone.ontransitionend = ({ target, currentTarget }) => {
      if (target === currentTarget) wrapUI();
    };

    const targetHeight = Math.min(
      targetEl.current
        ? targetEl.current!.clientHeight
        : initialCenter.current!.dimensions[1],
      elToTransitionToQueue.current!.clientHeight
    );
    const targetWidth = Math.min(
      targetHeight,
      targetEl.current
        ? targetEl.current!.clientWidth
        : initialCenter.current!.dimensions[0],
      elToTransitionToQueue.current!.clientWidth
    );

    const targetScaleX =
      targetWidth / elToTransitionToQueue.current!.clientWidth;

    const targetScaleY =
      targetHeight / elToTransitionToQueue.current!.clientHeight;

    document.body.appendChild(clone);
    setTimeout(() => {
      clone.style.opacity = "0";
      clone.style.transform = `translateX(${
        targetCenter.x - currPosCenter.x
      }px) translateY(${
        targetCenter.y - currPosCenter.y
      }px) scaleX(${targetScaleX}) scaleY(${targetScaleY})`;
      clone.addEventListener("transitionend", ({ target, currentTarget }) => {
        if (target === currentTarget) clone.remove();
      });
    }, 100);
  }, []);
  return Object.entries(functionsToQueue).reduce(
    (r, [k, v]) => {
      const _process = (...args: any[]) => {
        let promise = v(...args);
        loadingRef.current = () =>
          watchPromise(promise, () => v(...args), ...UIParamsFactory(k));
        promise.finally(() => (loadingRef.current = null));
        if (process.env.NODE_ENV === "development")
          promise = securePromise(promise);
        return promise;
      };
      return {
        ...r,
        [k]: _process,
      };
    },
    { elToTransitionToQueue, wrapQueue } as T & {
      elToTransitionToQueue: RefObject<HTMLDivElement>;
      /**
       * Function that wraps the current running actions and animates to the target queue element
       */
      wrapQueue: () => void;
    }
  );
}
