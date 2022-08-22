import React, {
  createContext,
  PropsWithChildren,
  ReactElement,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type ReactElementWithState = ReactElement & {
  status: "loading" | "succeded" | "failed";
};

const Context = createContext<{
  targetElRef: RefObject<HTMLElement>;
  pendingTransactions: ReturnType<typeof useCounter>;
  UIs: ReactElementWithState[];
  setUIs: (
    func: (prev: ReactElementWithState[]) => ReactElementWithState[]
  ) => void;
}>(null as any);

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
export function AsyncProcessQueueProvider({ children }: PropsWithChildren<{}>) {
  const targetRef = useRef<HTMLElement>(null);
  const pendingCounter = useCounter();
  const [UIs, setUIs] = useState<ReactElementWithState[]>([]);

  return (
    <Context.Provider
      value={{
        targetElRef: targetRef,
        pendingTransactions: pendingCounter,
        setUIs,
        UIs,
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

/**
 * This function wraps other async functions and decides when the ongoing promise should be put on the queue or not
 */
export function useAsyncProcessQueue<
  T extends {
    [k: string]: (...args: any[]) => Promise<any>;
  }
>(
  functionsToQueue: T,
  UIFactory: (functionName: keyof T) => UIStateFactory
): T & {
  elToTransitionToQueue: RefObject<HTMLElement>;
  /**
   * Function that wraps the current running actions and animates to the target queue element
   */
  wrapQueue: () => void;
} {
  const loadingRef = useRef<Function | null>(null);
  const wrapped = useRef(false);
  const elToTransitionToQueue = useRef<HTMLElement>(null);
  const { targetElRef: targetEl, setUIs } = useContext(Context);
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
      const process = (...args: any[]) => {
        const promise = v(...args);
        loadingRef.current = function () {
          // Write the loading UI
          const LoadingUIInstance = {
            ...UIFactory(k)("loading"),
            status: "loading",
          } as ReactElementWithState;
          setUIs((prev) => [
            ...prev.filter((a) => a.key !== LoadingUIInstance.key),
            LoadingUIInstance,
          ]);

          promise.then((result) => {
            const UIInstance = UIFactory(k)(
              "succeded"
            ) as ReactElementWithState;

            // Write success UI
            setUIs((prev) =>
              prev.map((a) =>
                a === LoadingUIInstance
                  ? { ...UIInstance, status: "succeded" }
                  : a
              )
            );

            return result;
          });
          promise.catch((error) => {
            const UIInstance = UIFactory(k)(
              "failed",
              error,
              () => setUIs((prev) => prev.filter((ui) => ui !== UIInstance)),
              () => {
                process(...args);
                loadingRef.current!();
              }
            ) as ReactElementWithState;
            // Write success UI
            setUIs((prev) =>
              prev.map((a) =>
                a === LoadingUIInstance
                  ? { ...UIInstance, status: "failed" }
                  : a
              )
            );

            throw error;
          });
          return promise;
        };
        promise.finally(() => {
          loadingRef.current = null;
        });
      };
      return {
        ...r,
        [k]: process,
      };
    },
    { elToTransitionToQueue, wrapQueue } as T & {
      elToTransitionToQueue: RefObject<HTMLElement>;
      /**
       * Function that wraps the current running actions and animates to the target queue element
       */
      wrapQueue: () => void;
    }
  );
}
