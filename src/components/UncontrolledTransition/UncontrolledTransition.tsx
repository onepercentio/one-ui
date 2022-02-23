import React, {
  ComponentProps,
  ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import Transition from "../Transition";
import { TransitionProps } from "../Transition/Transition";

/**
 * This component handles when a child changes and transition this child change, allowing the finest experiences
 **/
function UncontrolledTransition(
  {
    className = "",
    contentClassName,
    children = <React.Fragment key="default"></React.Fragment>,
    lockTransitionWidth = true,
    transitionType,
    contentStyle,
  }: {
    className?: string;
    contentClassName?: string;
    children?: React.ReactElement;
    lockTransitionWidth?: boolean;
    transitionType?: ComponentProps<typeof Transition>["transitionType"];
  } & Pick<TransitionProps, "contentStyle">,
  ref: ForwardedRef<{
    setOrientation: (orientation: "forward" | "backward") => void;
  }>
) {
  const [childStack, setChildStack] = useState<React.ReactElement[]>([]);
  const [offset, setOffset] = useState(1);
  const [orientation, setOrientation] =
    useState<"forward" | "backward">("forward");

  useImperativeHandle(
    ref,
    () => ({
      setOrientation,
    }),
    []
  );

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && !children.key)
      throw new Error(
        "The provided child should have a key property, please provide it"
      );
    if (orientation === "forward") setChildStack((p) => [...p, children]);
    else setChildStack((p) => [children, ...p]);
  }, [children.key]);

  useEffect(() => {
    if (orientation === "backward") {
      setOffset(2);
    }
  }, [childStack.length]);

  return (
    <>
      {childStack.length ? (
        <Transition
          contentStyle={contentStyle}
          className={className}
          step={childStack.length - offset}
          onDiscardStep={(discardedKey) => {
            setChildStack((prev) => {
              return prev.filter((a) => a.key !== discardedKey);
            });
            setOffset(1);
            setOrientation("forward");
          }}
          lockTransitionWidth={lockTransitionWidth}
          contentClassName={contentClassName}
          transitionType={transitionType}
        >
          {childStack}
        </Transition>
      ) : null}
    </>
  );
}

export default forwardRef(UncontrolledTransition);
