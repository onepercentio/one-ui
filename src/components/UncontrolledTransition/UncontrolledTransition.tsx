import React, {
  ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import Transition from "../Transition";

/**
 * This component handles when a child changes and transition this child change, allowing the finest experiences
 **/
function UncontrolledTransition(
  {
    className = "",
    children = <React.Fragment key="default"></React.Fragment>,
    lockTransitionWidth = true,
  }: {
    className?: string;
    children?: React.ReactElement;
    lockTransitionWidth?: boolean;
  },
  ref: ForwardedRef<{
    setOrientation: (orientation: "forward" | "backward") => void;
  }>
) {
  const [childStack, setChildStack] = useState<React.ReactElement[]>([]);
  const [offset, setOffset] = useState(1);
  const [orientation, setOrientation] = useState<"forward" | "backward">(
    "forward"
  );

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
          className={className}
          step={childStack.length - offset}
          onDiscardStep={(discardedKey) => {
            
            setChildStack((prev) => {
              console.warn("Discarded", discardedKey, prev.filter((a, i) => i !== discardedKey).map(a => a.key));
              return prev.filter((a) => a.key !== discardedKey);
            });
            setOffset(1);
            setOrientation("forward");
          }}
          lockTransitionWidth={lockTransitionWidth}
        >
          {childStack}
        </Transition>
      ) : null}
    </>
  );
}

export default forwardRef(UncontrolledTransition);
