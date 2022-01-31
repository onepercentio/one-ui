import React, {
  DetailedHTMLProps,
  ForwardedRef,
  forwardRef,
  HTMLAttributes,
  MutableRefObject,
  PropsWithChildren,
  useEffect,
  useRef,
} from "react";
import Styles from "./Parallax.module.scss";
import { throttle } from "lodash";
import {
  flattenMatrix,
  generateMatrixFromOperations,
  invertMatrix,
} from "./math/helpers";

const MAXIMUM_PARALLAX = {
  x: 20,
  y: 20,
};

export function calculateDistanceRelativeToBounds(
  mousePosition: number,
  elementInitialPosition: number,
  elementSizeDimension: number
) {
  const normalizeInitialPosition = mousePosition - elementInitialPosition;
  const doNotAllowGoingBeyondLowerLimit = Math.max(normalizeInitialPosition, 0);
  const doNotAllowHoingBeyondHigherLimit = Math.min(
    doNotAllowGoingBeyondLowerLimit,
    elementSizeDimension
  );
  const threeRule =
    (doNotAllowHoingBeyondHigherLimit * 100) / elementSizeDimension;
  const result = Math.round(threeRule) / 100;
  return result;
}

export function givenTheRelativePositionHowMuchToRotate(
  relativePosition: number,
  maxRotation: number
) {
  return relativePosition * maxRotation - maxRotation / 2;
}

type Props = PropsWithChildren<{
  className?: string;
  active: boolean;
  onClick?: (e: any) => void;
  reflection?: boolean;
}> &
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

/**
 * It holds a children and animates it according to mouse position
 **/
function Parallax(
  { children, className = "", active, onClick, reflection, ...props }: Props,
  ref: ForwardedRef<HTMLDivElement>
) {
  const parallaxableRef = useRef<HTMLDivElement>(null);
  const reflectionRef = useRef<HTMLDivElement>(null);
  const multiplierRef = useRef<number>(1);
  const initialPositionRef = useRef<string>();
  useEffect(() => {
    if (ref)
      (ref as MutableRefObject<HTMLDivElement>).current =
        parallaxableRef.current!;
    const el = parallaxableRef.current!;
    if (active && !initialPositionRef.current) {
      initialPositionRef.current = getComputedStyle(el).transform;
      if (initialPositionRef.current === "none")
        initialPositionRef.current = "";
      el.setAttribute(
        "style",
        `transform: ${initialPositionRef.current} rotateX(0deg) rotateY(0deg) translateZ(0px) !important;`
      );
    }
    // eslint-disable-next-line
  }, [active]);

  useEffect(() => {
    const el = parallaxableRef.current!;
    if (active) {
      const updatePositions = (relativeToX: number, relativeToY: number) => {
        const rect = el.getBoundingClientRect();
        const {
          width: [x0, xW],
          height: [y0, yH],
        } = {
          width: [rect.left, el.clientWidth],
          height: [rect.top, el.clientHeight],
        };
        const distanceOffRight = calculateDistanceRelativeToBounds(
          relativeToX,
          x0,
          xW
        );
        const distanceOffBottom = calculateDistanceRelativeToBounds(
          relativeToY,
          y0,
          yH
        );
        const howMuchToRotateY =
          givenTheRelativePositionHowMuchToRotate(
            distanceOffRight,
            MAXIMUM_PARALLAX.y
          ) * multiplierRef.current;
        const howMuchToRotateX =
          givenTheRelativePositionHowMuchToRotate(
            distanceOffBottom,
            MAXIMUM_PARALLAX.x
          ) * multiplierRef.current;

        const howMuchToOpacify = Math.abs(
          Math.abs(distanceOffBottom - 0.5) / 0.5
        );
        const howMuchToOpacifyHorizontal = Math.max(
          Math.abs(Math.abs(distanceOffRight - 0.5) / 0.5),
          Math.abs(Math.abs(distanceOffBottom - 0.5) / 0.5)
        );
        el.setAttribute(
          "style",
          `transform: ${
            initialPositionRef.current
          }  rotateY(${howMuchToRotateY}deg) rotateX(${-howMuchToRotateX}deg) translateZ(${
            multiplierRef.current === 1 ? 0 : -30
          }px) !important;`
        );

        if (reflectionRef.current) {
          reflectionRef.current.style.left = `${(1 - distanceOffRight) * 100}%`;
          reflectionRef.current.style.top = `${(1 - distanceOffBottom) * 100}%`;
          reflectionRef.current.style.opacity = `${Math.min(
            howMuchToOpacify,
            howMuchToOpacifyHorizontal
          )}`;
        }
      };
      const handler = throttle(({ x, y }: MouseEvent) => {
        updatePositions(x, y);
      }, 1000 / 30);
      const touchHandler = throttle(({ touches }: TouchEvent) => {
        const { pageX, pageY } = touches[0];
        updatePositions(pageX, pageY);
      }, 1000 / 30);
      const mouseDownHandler = () => {
        multiplierRef.current = 1.5;
      };
      const mouseUpHandler = () => {
        multiplierRef.current = 1;
      };
      window.addEventListener("mousemove", handler);
      window.addEventListener("touchmove", touchHandler);
      let _inverseMatrix: number[] | undefined;
      const _limits: {
        [k in "beta" | "gamma"]?: [number, number];
      } = {
        beta: undefined,
        gamma: undefined,
      };
      const orientationListener: (e: DeviceOrientationEvent) => void = ({
        beta,
        gamma,
      }) => {
        beta = beta! * 0.5;
        gamma = gamma! * 0.5;
        if (!_inverseMatrix) {
          window.removeEventListener("mousemove", handler);
          window.removeEventListener("touchmove", touchHandler);
          const offset = 12.5;
          _limits.beta = [beta! - offset, beta! + offset];
          _limits.gamma = [gamma! - offset, gamma! + offset];
        }
        const _beta = Math.min(
          _limits.beta![1],
          Math.max(_limits.beta![0], beta!)
        );
        const _gamma = Math.min(
          _limits.gamma![1],
          Math.max(_limits.gamma![0], gamma!)
        );
        if (!_inverseMatrix) {
          _inverseMatrix = flattenMatrix(
            invertMatrix(
              generateMatrixFromOperations(
                {
                  type: "rotateY",
                  angle: _gamma!,
                },
                {
                  type: "rotateX",
                  angle: -_beta!,
                }
              )
            )
          );
        }
        el.setAttribute(
          "style",
          `transform: matrix3d(${_inverseMatrix.join(
            ","
          )}) rotateX(${-_beta!}deg) rotateY(${_gamma}deg) !important;`
        );
      };
      window.addEventListener("deviceorientation", orientationListener);
      window.addEventListener("touchend", () => {
        _inverseMatrix = undefined;
      });
      el.addEventListener("touchstart", mouseDownHandler);
      el.addEventListener("touchend", mouseUpHandler);
      el.addEventListener("mousedown", mouseDownHandler);
      el.addEventListener("mouseup", mouseUpHandler);

      return () => {
        window.removeEventListener("deviceorientation", orientationListener);
        window.removeEventListener("mousemove", handler);
        window.removeEventListener("touchmove", touchHandler);
        el.removeEventListener("mousedown", mouseDownHandler);
        el.removeEventListener("mouseup", mouseUpHandler);
        el.removeEventListener("touchstart", mouseDownHandler);
        el.removeEventListener("touchend", mouseUpHandler);
        // el.style.transform = initialPositionRef.current!;
        el.setAttribute(
          "style",
          `transform: rotateX(0deg) rotateY(0deg) translateZ(0px) !important;`
        );
      };
    }
  }, [active]);
  return (
    <div
      onClick={onClick}
      ref={parallaxableRef}
      className={`${Styles.parallax} ${className}`}
      {...props}
    >
      {children}
      {reflection && <div ref={reflectionRef} className={Styles.reflection} />}
    </div>
  );
}

export default forwardRef<HTMLDivElement, Props>(Parallax);
