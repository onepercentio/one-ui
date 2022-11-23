import { throttle } from "lodash";
import UncontrolledTransition from "../UncontrolledTransition";
import React, {
  createContext,
  DetailedHTMLProps,
  Fragment,
  HTMLAttributes,
  PropsWithChildren,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useHero from "../../hooks/useHero";
import AnimatedEntrance from "../AnimatedEntrance";
import { TransitionAnimationTypes } from "../Transition";
import Styles from "./OrderableList.module.scss";
import useEvents from "../../hooks/utility/useEvents";

type Events = "order-stop" | "order-start";

const OrderableListContext = createContext<{
  bindAnchor: (bindElement: HTMLDivElement) => void;
  unbindAnchor: (bindElement: HTMLDivElement) => void;
  on: (eventName: Events, cb: () => void) => () => void;
}>(null as any);

export enum OrderableListReorderMode {
  VERTICAL = "v",
  TWO_DIMENSIONS = "hv",
}

/**
 * This component receives a list of keyed elements and orders it based of the order provided via the prop "keyOrder"
 **/
export default function OrderableList({
  children,
  className = "",
  mode = OrderableListReorderMode.VERTICAL,
  ...props
}: {
  children: ReactElement[];
  className?: string;
  mode?: OrderableListReorderMode;
} & (
  | {
      keyOrder?: string[];
      onChangeKeyOrder: (newOrder: string[]) => void;
    }
  | {
      currentOrder?: string[];
    }
) &
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
  const eventEmitter = useEvents<Events, { [k in Events]: [] }>();
  const currentClone = useRef<HTMLDivElement | null>(null);
  const currentWorkingKey = useRef<string>();
  const rootRef = useRef<HTMLDivElement>(null as any);
  const [_order, setOrder] = useState(() => {
    return (
      ("keyOrder" in props ? props.keyOrder : undefined) ||
      children.map((a) => a.key as string)
    );
  });
  const order = "currentOrder" in props ? props.currentOrder || _order : _order;
  const cleanOrder = useMemo(() => order.map((a) => a.split(";")[0]), [order]);
  const orderId = useMemo(() => "key-" + cleanOrder.join(""), [cleanOrder]);

  const findParentElement = (target: HTMLDivElement) => {
    let parent: HTMLDivElement = target as HTMLDivElement;
    while (parent.parentElement !== rootRef.current) {
      if (parent.parentElement === null) break;
      parent = parent.parentElement as any;
    }
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
    const els = Array.from(rootRef.current!.children) as HTMLDivElement[];

    const calculateReorderingCall = (e: any) => {
      const els = Array.from(rootRef.current!.children) as HTMLDivElement[];
      calculateReordering(e, els, cleanOrder);
    };
    for (let el of els)
      el.addEventListener("mousemove", calculateReorderingCall);

    if ("onChangeKeyOrder" in props) props.onChangeKeyOrder(cleanOrder);

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
    currentClone.current = clone;
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
        function cleanUp() {
          eventEmitter.dispatcher("order-stop");
          rootRef.current.classList.remove(Styles.ordering);
          for (let el of els) el.classList.remove(Styles.visible);
          clone.remove();
          currentClone.current = null;
          for (let el of Array.from(elInvisible.children) as HTMLDivElement[])
            el.style.height = "";
        }
        if (
          clone.style.top.startsWith(Math.floor(box.top).toString()) &&
          clone.style.left.startsWith(Math.floor(box.left).toString())
        ) {
          cleanUp();
        }
        clone.style.top = `${box.top}px`;
        clone.style.left = `${box.left}px`;
        clone.style.transition = `top 500ms linear, left 500ms linear`;
        clone.addEventListener("transitionend", () => {
          cleanUp();
        });
      }
    };
    for (let el of els) el.classList.add(Styles.visible);
    parent.style.visibility = "hidden";
    parent.classList.remove(Styles.visible);
    rootRef.current.classList.add(Styles.ordering);
    currentWorkingKey.current = cleanOrderRef.current[els.indexOf(parent)];
    eventEmitter.dispatcher("order-start");
    window.document.body.classList.add(Styles.unselectable);
    window.addEventListener("mouseup", deleteClone);
    window.addEventListener("mousemove", movementControl);
  }, []);

  useLayoutEffect(() => {
    if (currentClone.current) {
      const els = Array.from(rootRef.current!.children) as HTMLDivElement[];
      const elInvisible = els.find(
        (a) =>
          !a.classList.contains(Styles.visible) && a.style.maxHeight !== "0px"
      )!;
      (elInvisible.children[0] as HTMLDivElement).style.height = `${
        currentClone.current!.clientHeight
      }px`;
      setTimeout(() => {
        (elInvisible.children[1] as HTMLDivElement).style.height = `${
          currentClone.current!.clientHeight
        }px`;
      }, 150);
    }
  }, [cleanOrder]);

  return (
    <OrderableListContext.Provider
      value={{
        bindAnchor: (el) => {
          el.addEventListener("mousedown", onAnchorClick);
        },
        unbindAnchor: (el) => {
          el.removeEventListener("mousedown", onAnchorClick);
        },
        on: eventEmitter.subscriber,
      }}
    >
      <div ref={rootRef} className={`${Styles.root} ${className}`} {...props}>
        {mode === OrderableListReorderMode.VERTICAL ? (
          <AnimatedEntrance>
            {[...children]
              .filter((a) => cleanOrder.includes(a.key as string))
              .sort(
                (a, b) =>
                  cleanOrder.indexOf(a.key as string) -
                  cleanOrder.indexOf(b.key as string)
              )
              .map((a: ReactElement, i) => ({
                ...a,
                key: order[i],
              }))}
          </AnimatedEntrance>
        ) : (
          <UncontrolledTransition
            className={Styles.transition}
            transitionType={TransitionAnimationTypes.FADE}
            contentClassName={`${className}`}
          >
            <Fragment key={orderId}>
              {[...children]
                .filter((a) => cleanOrder.includes(a.key as string))
                .sort(
                  (a, b) =>
                    cleanOrder.indexOf(a.key as string) -
                    cleanOrder.indexOf(b.key as string)
                )
                .map((a, i) => (
                  <HeroWrapper key={i} id={a.key as string}>
                    {a}
                  </HeroWrapper>
                ))}
            </Fragment>
          </UncontrolledTransition>
        )}
      </div>
    </OrderableListContext.Provider>
  );
}

function HeroWrapper({ children, id }: PropsWithChildren<{ id: string }>) {
  const { heroRef } = useHero(id);
  return <div ref={heroRef}>{children}</div>;
}

export function useOrderableListAnchor() {
  const anchorRef = useRef<HTMLDivElement>(null as any);
  const ctx = useContext(OrderableListContext);
  useLayoutEffect(() => {
    if (!ctx) return;
    const { bindAnchor, unbindAnchor } = ctx;
    bindAnchor(anchorRef.current!);
    return () => unbindAnchor(anchorRef.current!);
  }, []);
  return {
    anchorRef: ctx ? anchorRef : undefined,
  };
}

export function useOrderableEvents(
  events: {
    [k in Events]: () => void;
  }
) {
  const { on } = useContext(OrderableListContext);
  useEffect(() => {
    const unsubscribers: any[] = [];
    for (let eventName in events) {
      unsubscribers.push(on(eventName as Events, events[eventName as Events]));
    }
    return () => {
      unsubscribers.forEach((u) => u());
    };
  }, [events]);
}
