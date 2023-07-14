import throttle from "lodash/throttle";
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
import ownEvent from "../../utils/ownEvent";

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

function cleanKeys(keys: string[]) {
  return keys.map((a) => a.split(";")[0]);
}

/**
 * This component receives a list of keyed elements and orders it based of the order provided via the prop "keyOrder"
 **/
export default function OrderableList({
  children,
  className = "",
  mode = OrderableListReorderMode.VERTICAL,
  shrinkToOnOrder,
  reorderingClassName,
  cloneClassName,
  ...props
}: {
  children: ReactElement[];
  className?: string;
  mode?: OrderableListReorderMode;
  /**
   * If provided, makes the elements shrink to this value in px when ordering elements
   */
  shrinkToOnOrder?: number;

  /**
   * A class to apply when reordering
   */
  reorderingClassName?: string;

  /**
   * A class to apply to the clone el
   */
  cloneClassName?: string;
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
  const { current: anchorsList } = useRef<HTMLDivElement[]>([]);
  const eventEmitter = useEvents<Events, { [k in Events]: [] }>();
  const currentClone = useRef<HTMLDivElement | null>(null);
  const currentWorkingKey = useRef<string>();
  const availableKeys = children.map((a) => a.key as string);
  const rootRef = useRef<HTMLDivElement>(null as any);
  const [_order, setOrder] = useState(() => {
    const missingOrderKeys =
      "keyOrder" in props && props.keyOrder
        ? availableKeys.filter((a) => !props.keyOrder!.includes(a))
        : [];

    return (
      ("keyOrder" in props && props.keyOrder
        ? [...props.keyOrder, ...missingOrderKeys]
        : undefined) || availableKeys
    );
  });
  const order = useMemo(() => {
    return (
      "currentOrder" in props ? props.currentOrder || _order : _order
    ).filter((o) => o.includes(";") || availableKeys.includes(o));
  }, [(props as any).currentOrder, _order]);
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

  useLayoutEffect(() => {
    if (shrinkToOnOrder)
      rootRef.current.style.setProperty("--shrink-to", `${shrinkToOnOrder}px`);
  }, [shrinkToOnOrder]);

  const calculateReordering = useMemo(() => {
    return throttle((e: any, els: HTMLDivElement[], currentOrder: string[]) => {
      if (els.length > currentOrder.length || !currentWorkingKey.current)
        return;
      const parent = findParentElement(e.target);
      const indexOfKeyInCleanOrder = els.indexOf(parent);
      const keyOfTheOverElement = currentOrder[indexOfKeyInCleanOrder];
      const isDraggingOwnElement =
        currentWorkingKey.current === keyOfTheOverElement;
      if (indexOfKeyInCleanOrder === -1 || keyOfTheOverElement === undefined)
        return;
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
        const indexOfTheNewElement =
          indexOfKeyInCleanOrder + (isAfter ? 1 : -1);
        const shouldTriggerReordering =
          (isAfter || isBefore) &&
          checkIfCanMove(currentOrder[indexOfTheNewElement]);
        if (shouldTriggerReordering) {
          setOrder((p) => {
            const previousIndex = currentOrder.indexOf(
              currentWorkingKey.current!
            );
            const indexOfKeyInProvidedOrder =
              cleanKeys(p).indexOf(keyOfTheOverElement);
            let indexOfTheNewElement =
              indexOfKeyInProvidedOrder + (isBefore ? -1 : 0);
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

    return () => {
      for (let el of els)
        el.removeEventListener("mousemove", calculateReorderingCall);
    };
  }, [cleanOrder]);

  useEffect(() => {
    if ("onChangeKeyOrder" in props) props.onChangeKeyOrder(cleanKeys(_order));
  }, [_order]);

  const cleanOrderRef = useRef(cleanOrder);
  useEffect(() => {
    cleanOrderRef.current = cleanOrder;
  }, [cleanOrder]);
  const onAnchorClick = useCallback(
    ({ target: anchor }: Pick<MouseEvent, "target">) => {
      let offset: [x: number, y: number];
      const orderableListItemForAnchor = findParentElement(
        anchor as HTMLDivElement
      );
      const box = orderableListItemForAnchor.getBoundingClientRect();
      const els = Array.from(rootRef.current!.children) as HTMLDivElement[];
      const elIndex = els.indexOf(orderableListItemForAnchor);

      const clone = orderableListItemForAnchor.cloneNode(
        true
      ) as HTMLDivElement;
      currentClone.current = clone;
      if (process.env.NODE_ENV === "development")
        clone.setAttribute("data-testid", "orderable-list-clone");
      clone.setAttribute("data-orderableid", "orderable-list-clone");
      clone.style.width = `${box.width}px`;
      clone.style.height = `${box.height}px`;
      clone.style.top = `${box.top}px`;
      clone.style.left = `${box.left}px`;
      clone.classList.add(Styles.clone);
      if (shrinkToOnOrder) clone.style.maxHeight = `${box.height}px`;
      setTimeout(() => {
        if (cloneClassName) clone.classList.add(cloneClassName);
        if (shrinkToOnOrder) clone.style.maxHeight = `${shrinkToOnOrder}px`;
      }, 0);

      orderableListItemForAnchor.classList.add(Styles.currentOrdering);
      orderableListItemForAnchor.classList.remove(Styles.visible);

      const movementControl = (e: MouseEvent | TouchEvent) => {
        const { x: x1, y: y1 } =
          "touches" in e ? { x: e.touches[0].pageX, y: e.touches[0].pageY } : e;
        if (!offset) offset = [x1 - box.left, y1 - box.top];

        const [offsetX, offsetY] = offset;
        clone.style.top = `${y1 - offsetY}px`;
        clone.style.left = `${x1 - offsetX}px`;
      };

      document.body.appendChild(clone);
      const deleteClone = () => {
        window.removeEventListener("mousemove", movementControl);
        window.removeEventListener("touchmove", movementControl);
        window.removeEventListener("touchend", deleteClone);
        window.removeEventListener("mouseup", deleteClone);
        orderableListItemForAnchor.style.visibility = "initial";
        currentWorkingKey.current = undefined;
        window.document.body.classList.remove(Styles.unselectable);
        {
          const els = Array.from(rootRef.current!.children) as HTMLDivElement[];
          const elInvisible = els.find(
            (a) =>
              !a.classList.contains(Styles.visible) &&
              a.style.maxHeight !== "0px"
          )!;
          if (shrinkToOnOrder) {
            const child = elInvisible.lastElementChild as HTMLDivElement;
            child.style.maxHeight = `${child.scrollHeight}px`;
            child.classList.add(Styles.transitionHeight);
            const onEnd = ownEvent(() => {
              child.removeEventListener("transitionend", onEnd);
              child.style.maxHeight = `initial`;
              child.classList.remove(Styles.transitionHeight);
            });
            child.addEventListener("transitionend", onEnd);
          }
          const box = elInvisible.getBoundingClientRect();
          function cleanUp() {
            if (shrinkToOnOrder) {
              rootRef.current.style.removeProperty("padding-top");
              rootRef.current.style.removeProperty("min-height");
            }

            eventEmitter.dispatcher("order-stop");
            rootRef.current.classList.remove(Styles.ordering);
            if (reorderingClassName)
              rootRef.current.classList.remove(reorderingClassName);
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
          } else {
            clone.style.top = `${box.top}px`;
            clone.style.left = `${box.left}px`;
            clone.style.transition = `top 500ms linear, left 500ms linear`;
            clone.addEventListener("transitionend", () => {
              cleanUp();
            });
          }
        }
      };
      for (let el of els) {
        el.classList.add(Styles.visible);
      }
      if (shrinkToOnOrder) {
        for (let el of els) el.style.maxHeight = `${el.scrollHeight}px`;
        const targetHeight = elIndex * shrinkToOnOrder;
        const currentHeight =
          orderableListItemForAnchor.offsetTop - els[0].offsetTop;
        const paddingTop = currentHeight - targetHeight;
        rootRef.current.style.paddingTop = `${paddingTop}px`;
        rootRef.current.style.minHeight = `${rootRef.current.clientHeight}px`;
      }
      orderableListItemForAnchor.style.visibility = "hidden";
      orderableListItemForAnchor.classList.remove(Styles.visible);
      rootRef.current.classList.add(Styles.ordering);
      if (reorderingClassName)
        rootRef.current.classList.add(reorderingClassName);
      currentWorkingKey.current = cleanOrderRef.current[elIndex];
      eventEmitter.dispatcher("order-start");
      window.document.body.classList.add(Styles.unselectable);
      window.addEventListener("mouseup", deleteClone);
      window.addEventListener("mousemove", movementControl);
      window.addEventListener("touchend", deleteClone);
      window.addEventListener("touchmove", movementControl);
    },
    []
  );

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

  const toSpread = { ...props } as any;
  delete toSpread.keyOrder;
  delete toSpread.onChangeKeyOrder;

  const childrenToRender = [...children]
    .filter((a) => cleanOrder.includes(a.key as string))
    .sort(
      (a, b) =>
        cleanOrder.indexOf(a.key as string) -
        cleanOrder.indexOf(b.key as string)
    )
    .map((a: ReactElement, i) => ({
      ...a,
      key: order[i],
    }));

  useLayoutEffect(() => {
    rootRef.current!.addEventListener("touchstart", (e) => {
      const relatedAnchor = anchorsList.find((anchor) =>
        anchor.contains(e.target as any)
      );
      if (relatedAnchor) {
        e.preventDefault();
        onAnchorClick({
          target: relatedAnchor,
        });

        const moveCb = throttle((e: TouchEvent) => {
          const touch = e.touches[0];
          const [x, y] = [touch.clientX, touch.clientY];
          const els = Array.from(rootRef.current.children) as HTMLDivElement[];
          const currentElementIdx = els.findIndex((c, i) => {
            const rect = c?.getBoundingClientRect();
            if (!rect) return false;
            return rect.top < y && rect.top + rect.height > y;
          });
          if (currentElementIdx !== -1) {
            const el = els[currentElementIdx];
            const rect = el.getBoundingClientRect();
            calculateReordering(
              {
                target: el,
                offsetY: y - rect.top,
              },
              els,
              cleanOrderRef.current
            );
          }
        }, 500);
        const t = e.target as HTMLDivElement;
        const touchMoveCb = (e: TouchEvent) => {
          e.stopPropagation();
          window.dispatchEvent(new TouchEvent(e.type, e as any));
          moveCb(e);
        };
        const removeCb = (e: TouchEvent) => {
          t.removeEventListener("touchmove", touchMoveCb);
          t.removeEventListener("touchend", removeCb);
          window.dispatchEvent(new TouchEvent(e.type, e as any));
        };
        t.addEventListener("touchmove", touchMoveCb);
        t.addEventListener("touchend", removeCb);
      }
    });
  }, []);

  const e = useMemo(
    () => ({
      bindAnchor: (el: HTMLDivElement) => {
        el.addEventListener("mousedown", onAnchorClick);
        anchorsList.push(el);
      },
      unbindAnchor: (el: HTMLDivElement) => {
        el.removeEventListener("mousedown", onAnchorClick);
        anchorsList.splice(anchorsList.indexOf(el), 1);
      },
      on: eventEmitter.subscriber,
    }),
    []
  );

  return (
    <OrderableListContext.Provider value={e}>
      <div
        ref={rootRef}
        className={`${Styles.root} ${className} ${
          shrinkToOnOrder ? Styles.shrinkable : ""
        }`}
        {...toSpread}
      >
        {mode === OrderableListReorderMode.VERTICAL ? (
          <AnimatedEntrance>{childrenToRender}</AnimatedEntrance>
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
  const { heroRef } = useHero(id, undefined, {
    onHeroStart: (_c, _o, t) => {
      t.querySelectorAll("img").forEach(
        (img) => (img.style.visibility = "hidden")
      );
    },
    onHeroEnd: () => {
      if (heroRef.current)
        heroRef.current
          .querySelectorAll("img")
          .forEach((img) => (img.style.visibility = ""));
    },
  });
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
