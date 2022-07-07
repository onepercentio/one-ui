import React, {
  createContext,
  LegacyRef,
  PropsWithChildren,
  RefObject,
  useContext,
  useLayoutEffect,
  useRef,
} from "react";

const Context = createContext<{ targetElRef: RefObject<HTMLElement> }>(
  null as any
);

/**
 * This propagates the utilitary functions
 */
export function AsyncProcessQueueProvider({ children }: PropsWithChildren<{}>) {
  const targetRef = useRef<HTMLElement>(null);
  return (
    <Context.Provider
      value={{
        targetElRef: targetRef,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useAsyncProcessQueueContext() {
  return useContext(Context);
}

/**
 * This function wraps other async functions and decides when the ongoing promise should be put on the queue or not
 */
export function useAsyncProcessQueue<
  T extends {
    [k: string]: (...args: any[]) => Promise<any>;
  }
>(functionsToQueue: T): T & { elToTransitionToQueue: RefObject<HTMLElement> } {
  const { current: promisesToQueue } = useRef<Promise<any>[]>([]);
  const elToTransitionToQueue = useRef<HTMLElement>(null);
  const targetEl = useContext(Context).targetElRef;
  useLayoutEffect(
    () => () => {
      const clone = elToTransitionToQueue.current!.cloneNode(
        true
      ) as HTMLElement;
      const currPositionOnViewport =
        elToTransitionToQueue.current!.getBoundingClientRect();

      function calculateCenter(el: HTMLElement) {
        const boundsOnViewport = el.getBoundingClientRect();
        return {
          x: boundsOnViewport.x + boundsOnViewport.width / 2,
          y: boundsOnViewport.y + boundsOnViewport.height / 2,
        };
      }
      const currPosCenter = calculateCenter(elToTransitionToQueue.current!);
      const targetCenter = calculateCenter(targetEl.current!);
      clone.style.position = "fixed";
      clone.style.top = `${currPositionOnViewport.top}px`;
      clone.style.left = `${currPositionOnViewport.left}px`;
      clone.style.width = `${currPositionOnViewport.width}px`;
      clone.style.height = `${currPositionOnViewport.height}px`;
      clone.style.transition = `transform 500ms cubic-bezier(.3,.28,0,.95), opacity 500ms cubic-bezier(.25,.28,.86,-0.38)`;
      clone.style.backgroundColor = "red";
      clone.style.opacity = "1";

      const targetHeight = Math.min(
        targetEl.current!.clientHeight,
        elToTransitionToQueue.current!.clientHeight
      );
      const targetWidth = Math.min(
        targetHeight,
        targetEl.current!.clientWidth,
        elToTransitionToQueue.current!.clientWidth
      );

      const targetScaleX =
        targetWidth / elToTransitionToQueue.current!.clientWidth;

      const targetScaleY =
        targetHeight / elToTransitionToQueue.current!.clientHeight;

      alert(`TX ${targetScaleX}`);

      document.body.appendChild(clone);
      setTimeout(() => {
        clone.style.opacity = "0";
        clone.style.transform = `translateX(${
          targetCenter.x - currPosCenter.x
        }px) translateY(${
          targetCenter.y - currPosCenter.y
        }px) scaleX(${targetScaleX}) scaleY(${targetScaleY})`;
      });
    },
    []
  );
  return Object.entries(functionsToQueue).reduce(
    (r, [k, v]) => ({
      ...r,
      [k]: (...args: any[]) => {
        const promise = v(...args);
        promisesToQueue.push(promise);
        promise.finally(() => {
          promisesToQueue.splice(promisesToQueue.indexOf(promise), 1);
        });
        return promise;
      },
    }),
    { elToTransitionToQueue } as T & {
      elToTransitionToQueue: RefObject<HTMLElement>;
    }
  );
}
