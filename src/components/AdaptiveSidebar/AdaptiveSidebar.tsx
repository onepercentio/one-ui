import React, {
  ForwardedRef,
  forwardRef,
  PropsWithChildren,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import MutableHamburgerButton from "../MutableHamburgerButton";
import ScrollAndFocusLock from "../utilitary/ScrollAndFocusLock";
import Styles from "./AdaptiveSidebar.module.scss";
import useBreakpoint from "../../hooks/ui/useBreakpoint";
import { createPortal } from "react-dom";

const DefaultVisibilityControl = ({ open }: { open: boolean }) => (
  <MutableHamburgerButton size={48} state={open ? "closed" : "default"} />
);

type AdaptiveSidebarControls = {
  dismiss: () => void;
};

/**
 * A component that you can put anywhere but hides when small enough and shows the control via a fixed floating button
 **/
function AdaptiveSidebar(
  {
    open: externalOpen,
    children,
    className = "",
    breakInto = 640,
    visibilityControlComponent:
      VisibilityControlComponent = DefaultVisibilityControl,
    ...props
  }: PropsWithChildren<
    {
      /** To control AdaptiveSidebar externally
       * (created for flows that requires floating views when on mobile)
       **/
      open?: boolean;
      /**
       * The screen width to turn into responsive mode
       */
      breakInto?: number;
      className?: string;
      visibilityControlComponent?: (props: {
        open: boolean;
      }) => React.ReactElement;
    } & Omit<React.HTMLProps<HTMLDivElement>, "ref">
  >,
  ref: ForwardedRef<AdaptiveSidebarControls>
) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const _open = externalOpen === undefined ? open : externalOpen;
  const isMobile = useBreakpoint(breakInto);

  useImperativeHandle(
    ref,
    () => ({
      dismiss: () => setOpen(false),
    }),
    []
  );

  useEffect(() => {
    if (process.env.NODE_ENV === "test") return;
    containerRef.current!.scrollTo({
      left: 0,
      behavior: "smooth",
      top: 0,
    });
  }, [_open]);
  const externalControl = externalOpen !== undefined;

  const content = (
    <div
      ref={containerRef}
      className={`${isMobile ? Styles.mobile : Styles.desktop} ${
        Styles.container
      } ${
        !externalControl &&
        DefaultVisibilityControl === VisibilityControlComponent
          ? Styles.defaultPadding
          : ""
      } ${_open ? Styles.open : Styles.closed} ${className}`}
      {...props}
    >
      <ScrollAndFocusLock open={_open}>{children}</ScrollAndFocusLock>
    </div>
  );

  return (
    <>
      {!externalControl && (
        <div
          className={`${isMobile ? Styles.mobile : Styles.desktop} ${
            Styles.hamburger
          }`}
          onClick={() => setOpen((a) => !a)}
        >
          <VisibilityControlComponent open={_open} />
        </div>
      )}
      {isMobile ? createPortal(content, document.body) : content}
    </>
  );
}

export default forwardRef(AdaptiveSidebar);
