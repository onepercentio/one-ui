import React, {
  ElementRef,
  ForwardedRef,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import UncontrolledTransition from "../UncontrolledTransition";
import Styles from "./MainGrid.module.scss";

function _MainGrid(
  {
    children,
    leftContent,
    rightContent,
  }: {
    leftContent?: React.ReactElement;
    rightContent?: React.ReactElement;
    children: React.ReactElement;
  },
  ref: ForwardedRef<
    Pick<ElementRef<typeof UncontrolledTransition>, "setOrientation">
  >
) {
  const refs = [
    useRef<ElementRef<typeof UncontrolledTransition>>(null),
    useRef<ElementRef<typeof UncontrolledTransition>>(null),
    useRef<ElementRef<typeof UncontrolledTransition>>(null),
  ];

  useImperativeHandle(
    ref,
    () => ({
      setOrientation: (orientation) => {
        refs.forEach((r) => r.current?.setOrientation(orientation));
      },
    }),
    []
  );

  return (
    <>
      <div className={Styles.container}>
        <div className={leftContent ? Styles.content : ""}>
          <UncontrolledTransition className={Styles.section} ref={refs[0]}>
            {leftContent}
          </UncontrolledTransition>
        </div>
        <div>
          <UncontrolledTransition className={Styles.section} ref={refs[1]}>
            {children}
          </UncontrolledTransition>
        </div>
        <div className={rightContent ? Styles.content : ""}>
          <UncontrolledTransition className={Styles.section} ref={refs[2]}>
            {rightContent}
          </UncontrolledTransition>
        </div>
      </div>
    </>
  );
}

/**
 * This layout divides the screen in 3 fragments and provides a responsive adaptation when on mobile
 **/
const MainGrid = forwardRef(_MainGrid);
export default MainGrid;
