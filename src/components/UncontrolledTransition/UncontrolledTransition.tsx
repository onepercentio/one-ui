import React, {
  ComponentProps,
  ForwardedRef,
  forwardRef,
  MutableRefObject,
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
    contentStyle,
    ...props
  }: {
    className?: string;
    contentClassName?: string;
    children?: React.ReactElement;
    lockTransitionWidth?: boolean;
  } & Pick<TransitionProps, "contentStyle"> &
    TransitionTypeDefinitions,
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
  // const [offset, setOffset] = useState(1);
  const orientation = useRef<"forward" | "backward">("forward");
  function setOrientation(a: typeof orientation.current) {
    try {
      throw new Error();
    } catch (e) {
      const stacktrace = (e as Error).stack;
      if (stacktrace?.includes("invokePassiveEffectCreate")) {
        throw new Error(`It seems you are calling the setBackwards from a useEffect. This will cause unexpected behaviour. Please switch to:
        
useLayoutEffect(() => {
  // do your thing
  ref.current.setOrientation("backwards")
})

`);
      }
    }
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
      setChildStack((prev) => ({
        ...prev,
        offset: 2,
      }));
    }
  }, [childStack.length]);

  console.warn(
    "Child stack length",
    childStack.map((a) => a.key)
  );

  return (
    <>
      {childStack.length ? (
        <Transition
          ref={sectionRef}
          contentStyle={contentStyle}
          className={className}
          step={childStack.length - offset}
          onDiscardStep={(discardedKey) => {
            orientation.current = "forward";
            setChildStack((prev) => {
              return {
                childStack: prev.childStack.filter(
                  (a) => a.key !== discardedKey
                ),
                offset: 1,
              };
            });
          }}
          lockTransitionWidth={lockTransitionWidth}
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
