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
    children = <React.Fragment key="default"></React.Fragment>,
  }: {
    children?: React.ReactElement;
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
          step={childStack.length - offset}
          onDiscardStep={(discardedIndex) => {
            setChildStack((prev) => {
              return prev.filter((a, i) => i !== discardedIndex);
            });
            setOffset(1);
            setOrientation("forward");
          }}
        >
          {childStack}
        </Transition>
      ) : null}
    </>
  );
}

export default forwardRef(UncontrolledTransition);
