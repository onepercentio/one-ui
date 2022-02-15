import React, {
  createRef,
  ForwardedRef,
  forwardRef,
  PropsWithChildren,
  RefObject,
  SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Styles from "./FadeIn.module.scss";

type FadeInProps = PropsWithChildren<{
  className?: string;
  active?: boolean;
  onClick?: (e: SyntheticEvent<HTMLDivElement>) => void;
}>;

/**
 * Receives a children and displays it with a fade in animation, also when it's removed, it hides with a fadeout
 **/
function FadeIn(
  { children, className = "", active, onClick }: FadeInProps,
  divRef: ForwardedRef<HTMLDivElement>
) {
  if (!divRef) {
    divRef = createRef();
  }
  const [, trigger] = useState(0);
  const prevChildren = useRef<typeof children>();
  prevChildren.current = children || prevChildren.current;

  useEffect(() => {
    const el = (divRef as RefObject<HTMLDivElement>).current!;
    const isElHidden = active !== undefined ? !active : !children;

    if (isElHidden) {
      el.classList.remove(Styles.active);
      const handler = () => {
        prevChildren.current = null;
        trigger((a) => a + 1);
      };
      el.addEventListener("transitionend", handler);
      return () => {
        el.removeEventListener("transitionend", handler);
      };
    } else {
      el.classList.add(Styles.active);
    }
  }, [children, active]);
  return (
    <div
      ref={divRef}
      data-testid="fadein_container"
      className={`${Styles.container} ${className}`}
      onClick={onClick}
    >
      {prevChildren.current}
    </div>
  );
}

export default forwardRef<HTMLDivElement, FadeInProps>(FadeIn);
