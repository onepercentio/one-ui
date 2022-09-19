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
import Styles from "./OrderableList.module.scss";

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
    if (process.env.NODE_ENV === "development" && parent === null)
      throw new Error(
        "It seems like we could not find a relation between this element and the root list. Are you using portals maybe?"
      );
    return parent;
  };

  const calculateReordering = useMemo(() => {
    return throttle((e: any, els: HTMLDivElement[], currentOrder: string[]) => {
      if (els.length > currentOrder.length || !currentWorkingKey.current)
        return;
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
    }, 1000 / 60);
  }, []);

  useEffect(() => {
    console.warn("How many?");
    const els = Array.from(rootRef.current!.children) as HTMLDivElement[];

    const calculateReorderingCall = (e: any) => {
      const els = Array.from(rootRef.current!.children) as HTMLDivElement[];
      calculateReordering(e, els, cleanOrder);
    };
    for (let el of els)
      el.addEventListener("mousemove", calculateReorderingCall);
    return () => {
      for (let el of els)
        el.removeEventListener("mousemove", calculateReorderingCall);
    };
  }, [cleanOrder]);

  const cleanOrderRef = useRef(cleanOrder);
  useEffect(() => {
    cleanOrderRef.current = cleanOrder;
  }, [cleanOrder]);
  const onAnchorClick = useCallback(({ target, x: x0, y: y0 }: MouseEvent) => {
    let offset: [x: number, y: number];
    const parent = findParentElement(target as HTMLDivElement);
    const box = parent.getBoundingClientRect();
    const els = Array.from(rootRef.current!.children) as HTMLDivElement[];

    const clone = parent.cloneNode(true) as HTMLDivElement;
    clone.setAttribute("data-testid", "orderable-list-clone");
    clone.style.width = `${box.width}px`;
    clone.style.height = `${box.height}px`;
    clone.style.top = `${box.top}px`;
    clone.style.left = `${box.left}px`;
    clone.classList.add(Styles.clone);
    parent.classList.add(Styles.currentOrdering);
    parent.classList.remove(Styles.visible);

    const movementControl = ({ x: x1, y: y1 }: MouseEvent) => {
      if (!offset) offset = [x1 - box.left, y1 - box.top];

      const [offsetX, offsetY] = offset;
      clone.style.top = `${y1 - offsetY}px`;
      clone.style.left = `${x1 - offsetX}px`;
    };

    document.body.appendChild(clone);
    const deleteClone = () => {
      window.removeEventListener("mousemove", movementControl);
      window.removeEventListener("mouseup", deleteClone);
      parent.style.visibility = "initial";
      currentWorkingKey.current = undefined;
      window.document.body.classList.remove(Styles.unselectable);
      {
        const els = Array.from(rootRef.current!.children) as HTMLDivElement[];
        const elInvisible = els.find(
          (a) =>
            !a.classList.contains(Styles.visible) && a.style.maxHeight !== "0px"
        )!;
        const box = elInvisible.getBoundingClientRect();
        clone.style.top = `${box.top}px`;
        clone.style.left = `${box.left}px`;
        clone.style.transition = `top 500ms linear, left 500ms linear`;
        clone.addEventListener("transitionend", () => {
          rootRef.current.classList.remove(Styles.ordering);
          for (let el of els) el.classList.remove(Styles.visible);
          clone.remove();
        });
      }
    };
    for (let el of els) el.classList.add(Styles.visible);
    parent.style.visibility = "hidden";
    parent.classList.remove(Styles.visible);
    rootRef.current.classList.add(Styles.ordering);
    currentWorkingKey.current = cleanOrderRef.current[els.indexOf(parent)];
    window.document.body.classList.add(Styles.unselectable);
    window.addEventListener("mouseup", deleteClone);
    window.addEventListener("mousemove", movementControl);
  }, []);

  return (
    <OrderableListContext.Provider
      value={{
        bindAnchor: (el) => {
          el.addEventListener("mousedown", onAnchorClick);
        },
        unbindAnchor: (el) => {
          el.removeEventListener("mousedown", onAnchorClick);
        },
      }}
    >
      <div ref={rootRef} className={Styles.root}>
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
