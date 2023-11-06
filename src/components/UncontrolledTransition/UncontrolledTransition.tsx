import React, {
  DetailedHTMLProps,
  ForwardedRef,
  forwardRef,
  Key,
  RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Transition from "../Transition";
import {
  TransitionProps,
  TransitionTypeDefinitions,
} from "../Transition/Transition";

function _UncontrolledTransition(
  {
    className = "",
    contentClassName,
    children = <React.Fragment key="default"></React.Fragment>,
    lockTransitionWidth = true,
    lockTransitionHeight = false,
    contentStyle,
    onDiscardStep,
    ...props
  }: {
    className?: string;
    contentClassName?: string;
    children?: React.ReactElement;
    lockTransitionWidth?: boolean;
    lockTransitionHeight?: boolean;
    onDiscardStep?: (key: Key) => void;
  } & Pick<TransitionProps, "contentStyle"> &
    TransitionTypeDefinitions &
    Omit<
      DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, any>,
      "className" | "children" | "ref"
    >,
  ref: ForwardedRef<{
    setOrientation: (orientation: "forward" | "backward") => void;
    sectionRef: RefObject<HTMLDivElement>;
  }>
) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [{ childStack, offset }, setChildStack] = useState<{
    childStack: (React.ReactElement & { createdAt: number })[];
    offset: number;
  }>(() => ({
    childStack: [{ ...children, createdAt: Date.now() }],
    offset: 1,
  }));
  const orientation = useRef<"forward" | "backward">("forward");
  function setOrientation(a: typeof orientation.current) {
    orientation.current = a;
  }

  useImperativeHandle(
    ref,
    () => ({
      setOrientation,
      sectionRef,
    }),
    []
  );

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && !children.key)
      throw new Error(
        "The provided child should have a key property, please provide it"
      );
    if (childStack.length === 1 && childStack[0].key === children.key) return;
    if (orientation.current === "forward")
      setChildStack((p) => ({
        ...p,
        childStack: [...p.childStack, { ...children, createdAt: Date.now() }],
      }));
    else
      setChildStack((p) => ({
        ...p,
        childStack: [{ ...children, createdAt: Date.now() }, ...p.childStack],
      }));
  }, [children.key]);

  useEffect(() => {
    if (orientation.current === "backward") {
      setChildStack((prev) => {
        return {
          ...prev,
          offset: prev.childStack.length,
        };
      });
    }
  }, [childStack.length]);

  childStack.forEach((a, i, arr) => {
    if (a.key === children.key)
      arr[i] = { ...children, createdAt: a.createdAt };
  });

  const predictedStep = childStack.length - offset;

  return (
    <>
      {childStack.length ? (
        <Transition
          ref={sectionRef}
          contentStyle={contentStyle}
          className={className}
          step={predictedStep}
          onDiscardStep={(discardedKey, animatedAt) => {
            if (onDiscardStep) onDiscardStep(discardedKey);
            orientation.current = "forward";
            setChildStack((prev) => {
              return {
                childStack: prev.childStack.filter((a) => {
                  return a.key !== discardedKey || a.createdAt > animatedAt;
                }),
                offset: prev.offset === 1 ? 1 : prev.offset - 1,
              };
            });
          }}
          lockTransitionWidth={lockTransitionWidth}
          lockTransitionHeight={lockTransitionHeight}
          contentClassName={contentClassName}
          {...props}
        >
          {childStack}
        </Transition>
      ) : null}
    </>
  );
}

/**
 * This component receives child with key and applies a transition when the key changes, allowing to swap elements with a fine transition.
 **/
const UncontrolledTransition = forwardRef(_UncontrolledTransition);
export default UncontrolledTransition;
