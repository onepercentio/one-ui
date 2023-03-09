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

/**
 * This component handles when a child changes and transition this child change, allowing the finest experiences
 **/
function UncontrolledTransition(
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
    childStack: React.ReactElement[];
    offset: number;
  }>({
    childStack: [children],
    offset: 1,
  });
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
        childStack: [...p.childStack, children],
      }));
    else
      setChildStack((p) => ({
        ...p,
        childStack: [children, ...p.childStack],
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
    if (a.key === children.key) arr[i] = children;
  });

  return (
    <>
      {childStack.length ? (
        <Transition
          ref={sectionRef}
          contentStyle={contentStyle}
          className={className}
          step={childStack.length - offset}
          onDiscardStep={(discardedKey) => {
            if (onDiscardStep) onDiscardStep(discardedKey);
            orientation.current = "forward";
            setChildStack((prev) => {
              return {
                childStack: prev.childStack.filter(
                  (a) => a.key !== discardedKey
                ),
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

export default forwardRef(UncontrolledTransition);
