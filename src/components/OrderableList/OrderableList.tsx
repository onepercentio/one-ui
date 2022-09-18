import { throttle } from "lodash";
import React, {
  createContext,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import AnimatedEntrance from "../AnimatedEntrance";

const OrderableListContext = createContext<{
  bindAnchor: (bindElement: HTMLDivElement) => void;
  unbindAnchor: (bindElement: HTMLDivElement) => void;
}>(null as any);

/**
 * This component receives a list of keyed elements and orders it based of the order provided via the prop "keyOrder"
 **/
export default function OrderableList({
  children,
  keyOrder,
}: {
  children: ReactElement[];
  keyOrder?: string[];
}) {
  const currentWorkingKey = useRef<string>();
  const rootRef = useRef<HTMLDivElement>(null as any);
  const [order, setOrder] = useState(() => {
    return keyOrder || children.map((a) => a.key as string);
  });
  const cleanOrder = useMemo(() => order.map((a) => a.split(";")[0]), [order]);

  const findParentElement = (target: HTMLDivElement) => {
    let parent: HTMLDivElement = target as HTMLDivElement;
    do {
      if (parent.parentElement === null) break;
      parent = parent.parentElement as any;
    } while (parent.parentElement !== rootRef.current);
    return parent;
  };

  const calculateReordering = useMemo(() => {
    return throttle((e: any, els: HTMLDivElement[], currentOrder: string[]) => {
      if (els.length > currentOrder.length) return;
      const parent = findParentElement(e.target);
      const indexOfOverKey = els.indexOf(parent);
      const keyOfTheOverElement = currentOrder[indexOfOverKey];
      const isDraggingOwnElement =
        currentWorkingKey.current === keyOfTheOverElement;

      if (indexOfOverKey === -1 || keyOfTheOverElement === undefined) return;
      if (!isDraggingOwnElement) {
        const distanceFromTop = e.offsetY;
        const heightOfEl = parent.clientHeight;
        const offset = heightOfEl * 0.25;
        const isAfter = distanceFromTop > heightOfEl - offset;
        const isBefore = distanceFromTop < offset;
        const checkIfCanMove = (keyOfOverElement?: string) => {
          return (
            keyOfOverElement === undefined ||
            keyOfOverElement !== currentWorkingKey.current
          );
        };
        const indexOfTheNewElement = indexOfOverKey + (isAfter ? 1 : -1);
        const shouldTriggerReordering =
          (isAfter || isBefore) &&
          checkIfCanMove(currentOrder[indexOfTheNewElement]);
        if (shouldTriggerReordering) {
          setOrder((p) => {
            const previousIndex = currentOrder.indexOf(
              currentWorkingKey.current!
            );
            let indexOfTheNewElement = indexOfOverKey + (isBefore ? -1 : 0);
            if (previousIndex > indexOfTheNewElement) indexOfTheNewElement++;
            const orderWithoutCurrent = p.filter((a) => {
              if (a.startsWith(`${currentWorkingKey.current};`)) return false;
              return a !== currentWorkingKey.current;
            });
            orderWithoutCurrent.splice(
              indexOfTheNewElement,
              0,
              `${currentWorkingKey.current};${Date.now()}`
            );
            return orderWithoutCurrent;
          });
        }
      }
    }, 500);
  }, []);

  useEffect(() => {
    const els = Array.from(rootRef.current!.children) as HTMLDivElement[];
    const calculateReorderingCall = (e: any) => {
      const els = Array.from(rootRef.current!.children) as HTMLDivElement[];
      calculateReordering(e, els, cleanOrder);
    };
    for (let el of els)
      el.addEventListener("dragover", calculateReorderingCall);
    return () => {
      for (let el of els)
        el.removeEventListener("dragover", calculateReorderingCall);
    };
  }, [cleanOrder]);

  useEffect(() => {
    const els = Array.from(rootRef.current!.children) as HTMLDivElement[];
    const startDrag = (e: DragEvent) => {
      const els = Array.from(rootRef.current!.children) as HTMLDivElement[];
      if (els.length > cleanOrder.length) return;
      currentWorkingKey.current =
        cleanOrder[els.indexOf(e.currentTarget as HTMLDivElement)];
    };
    for (let el of els) el.addEventListener("dragstart", startDrag);
    return () => {
      for (let el of els) el.removeEventListener("dragstart", startDrag);
    };
  }, [cleanOrder]);

  const onAnchorElOver = useCallback<any>(
    ({ target }: { target: HTMLDivElement }) => {
      const parent = findParentElement(target);
      if (process.env.NODE_ENV === "development" && parent === null)
        throw new Error(
          "It seems like we could not find a relation between this element and the root list. Are you using portals maybe?"
        );
      if (parent === null) return;
      const mouseExit = () => {
        parent.setAttribute("draggable", "false");
        target.removeEventListener("mouseleave", mouseExit);
      };
      parent.setAttribute("draggable", "true");
      target.addEventListener("mouseleave", mouseExit);
    },
    []
  );

  return (
    <OrderableListContext.Provider
      value={{
        bindAnchor: (el) => el.addEventListener("mouseenter", onAnchorElOver),
        unbindAnchor: (el) =>
          el.removeEventListener("mouseenter", onAnchorElOver),
      }}
    >
      <div ref={rootRef}>
        <AnimatedEntrance>
          {[...children]
            .filter((a) => cleanOrder.includes(a.key as string))
            .sort(
              (a, b) =>
                cleanOrder.indexOf(a.key as string) -
                cleanOrder.indexOf(b.key as string)
            )
            .map((a, i) => ({
              ...a,
              key: order[i],
            }))}
        </AnimatedEntrance>
      </div>
    </OrderableListContext.Provider>
  );
}

export function useOrderableListAnchor() {
  const anchorRef = useRef<HTMLDivElement>(null as any);
  const { bindAnchor, unbindAnchor } = useContext(OrderableListContext);
  useLayoutEffect(() => {
    bindAnchor(anchorRef.current!);
    return () => unbindAnchor(anchorRef.current!);
  }, []);
  return {
    anchorRef,
  };
}
