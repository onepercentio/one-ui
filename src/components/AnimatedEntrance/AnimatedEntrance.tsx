import React, {
  ElementRef,
  Fragment,
  Key,
  ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { TransitionAnimationTypes } from "../Transition";
import UncontrolledTransition from "../UncontrolledTransition";
import Styles from "./AnimatedEntrance.module.scss";

export enum EntranceType {
  SLIDE_AND_EXPAND,
  EXPAND,
}

const CONFIGS_BY_ENTRANCE_TYPE = {
  [EntranceType.SLIDE_AND_EXPAND]: {
    forward: {
      elementEntering: Styles.elementEntering,
      elementExiting: Styles.elementExiting,
    },
    backward: {
      elementEntering: Styles.elementEnteringReverse,
      elementExiting: Styles.elementExitingReverse,
    },
  },
  [EntranceType.EXPAND]: {
    forward: {
      elementEntering: Styles.elementExpanding,
      elementExiting: Styles.elementShrinking,
    },
    backward: {
      elementEntering: Styles.elementExpandingReverse,
      elementExiting: Styles.elementShrinkingReverse,
    },
  },
};

export function AnimatedEntranceItem({
  children,
  noEntranceAnimation,
  onRemoveChildren,
  entranceType,
}: {
  children: ReactElement;
  noEntranceAnimation: boolean;
  onRemoveChildren: (key: Key) => void;
  entranceType: EntranceType;
}) {
  const uncontRef = useRef<ElementRef<typeof UncontrolledTransition>>(null);
  const [screen, setScreen] = useState(
    noEntranceAnimation ? children : <Fragment key={"null"} />
  );
  useEffect(() => {
    if (String(children.key).includes("-nullated")) {
      uncontRef.current!.setOrientation("backward");
    }
    setScreen(children);
  }, [children.key]);

  useEffect(() => {
    const x = setTimeout(() => {
      const key = String(screen.key!);
      if (key === "null" || key.includes("-nullated"))
        uncontRef.current!.sectionRef.current!.style.maxHeight = `0px`;
      else {
        uncontRef.current!.sectionRef.current!.style.maxHeight = `${
          uncontRef.current!.sectionRef.current!.scrollHeight
        }px`;
        uncontRef.current!.sectionRef.current!.addEventListener(
          "transitionend",
          () => {
            uncontRef.current!.sectionRef.current!.style.maxHeight = "";
          }
        );
      }
    }, 100);
    return () => {
      clearTimeout(x);
    };
  }, [screen]);

  const className = useMemo(
    () => (!noEntranceAnimation ? Styles.maxHeight : ""),
    [String(children.key).includes("-nullated")]
  );

  return (
    <UncontrolledTransition
      ref={uncontRef}
      transitionType={TransitionAnimationTypes.CUSTOM}
      className={`${Styles.resetHeight} ${className}`}
      lockTransitionWidth
      key={String(children.key).replace("-nullated", "")}
      onDiscardStep={(k) => {
        if (k !== "null") onRemoveChildren(k!);
      }}
      config={CONFIGS_BY_ENTRANCE_TYPE[entranceType]}
    >
      {screen}
    </UncontrolledTransition>
  );
}

/**
 * Animates the entrance and exit of a component
 **/
export default function AnimatedEntrance({
  children,
  entranceType = EntranceType.SLIDE_AND_EXPAND,
}: {
  children: ReactElement[];
  entranceType?: EntranceType;
}) {
  const firstRef = useRef(true);
  useEffect(() => {
    firstRef.current = false;
  }, []);
  const prevChildren = useRef([] as typeof children);
  const childrenDelayed = useMemo(() => {
    const newChildren = children.filter(
      (c) => !prevChildren.current.find((a) => a.key === c.key)
    );
    const filteredOutChildren = prevChildren.current.map((c) => {
      return children.find((a) => a.key === c.key) ? ( // If the previous child still exists, mantain
        c
      ) : (
        // If not, toggle to null to animate exit
        <Fragment
          key={
            String(c.key).includes("-nullated") ? c.key : `${c.key}-nullated`
          }
        />
      );
    });

    for (let child of newChildren) {
      const previousChildKey = children[children.indexOf(child) - 1]?.key;
      if (previousChildKey) {
        filteredOutChildren.splice(
          filteredOutChildren.findIndex((a) => a.key === previousChildKey) + 1,
          0,
          child
        );
      } else {
        filteredOutChildren.unshift(child);
      }
    }

    return filteredOutChildren;
  }, [children]);
  prevChildren.current = childrenDelayed;

  return (
    <>
      {childrenDelayed.map((child) => (
        <AnimatedEntranceItem
          key={String(child.key!).replace("-nullated", "")}
          noEntranceAnimation={firstRef.current}
          entranceType={entranceType}
          onRemoveChildren={(k) =>
            (prevChildren.current = prevChildren.current.filter(
              (a) => a.key !== String(k) + "-nullated"
            ))
          }
        >
          {child}
        </AnimatedEntranceItem>
      ))}
    </>
  );
}
