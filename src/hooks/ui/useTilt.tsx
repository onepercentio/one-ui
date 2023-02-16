import throttle from "lodash/throttle";
import { RefObject, useEffect, useRef, useState } from "react";
import {
  flattenMatrix,
  generateMatrixFromOperations,
  IDENTITY_MATRIX,
  invertMatrix,
} from "../../components/Parallax/math/helpers";

const MAX_TILT = {
  x: 100,
  y: 100,
};

type Options = {
  round?: boolean;
  gyroEnabled?: boolean;
};

export function useTiltUpdates(
  active: boolean,
  relativeToEl: RefObject<HTMLDivElement>,
  onTilt: (p: { x: number; y: number }) => void,
  onInverseMatrix?: (updateFunc: (matrix: number[]) => number[]) => void,
  sensorScale: number = 1,
  tiltLimit: { x: number; y: number } = MAX_TILT,
  options?: Options
) {
  useEffect(() => {
    if (active) {
      const updatePositions = (relativeToX: number, relativeToY: number) => {
        const el = relativeToEl.current!;
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
          xW,
          options?.round ?? true
        );
        const distanceOffBottom = calculateDistanceRelativeToBounds(
          relativeToY,
          y0,
          yH,
          options?.round ?? true
        );
        const howMuchToRotateY = givenTheRelativePositionHowMuchToRotate(
          distanceOffRight,
          tiltLimit.y
        );
        const howMuchToRotateX = givenTheRelativePositionHowMuchToRotate(
          distanceOffBottom,
          tiltLimit.x
        );

        onTilt({
          y: howMuchToRotateX * 2,
          x: howMuchToRotateY * 2,
        });
      };
      const handler = throttle(({ x, y }: MouseEvent) => {
        updatePositions(x, y);
      }, 1000 / 30);
      const touchHandler = throttle(({ touches }: TouchEvent) => {
        const { pageX, pageY } = touches[0];
        updatePositions(pageX, pageY);
      }, 1000 / 30);
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
        if (!_inverseMatrix && onInverseMatrix) {
          onInverseMatrix(() => {
            return (_inverseMatrix = flattenMatrix(
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
            ));
          });
        }
        onTilt({
          y: -_beta * sensorScale,
          x: _gamma * sensorScale,
        });
      };
      function removeListeners() {
        window.removeEventListener("mousemove", handler);
        window.removeEventListener("touchmove", touchHandler);
      }
      if (options?.gyroEnabled ?? true) {
        window.addEventListener("deviceorientation", orientationListener);
        return () => {
          window.removeEventListener("deviceorientation", orientationListener);
          removeListeners();
        };
      } else {
        return () => removeListeners();
      }
    }
  }, [active, onInverseMatrix, onTilt]);
}

/**
 * This hook binds to two methods for calculating tilt
 *
 * When available: The device sensors
 * When on desktop: The mouse position relative to a ref
 */
export default function useTilt(
  active: boolean,
  /**
   * A scale to increase the values from the sensors
   *
   * @hack You can set this value to 0 as a way to disable the tilt calc on mobile
   */
  sensorScale: number = 1,
  maxTilt: { x: number; y: number } = MAX_TILT,
  options?: Options
) {
  const [tilt, setTilt] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [tiltResetMatrix, setTiltResetMatrix] = useState<number[]>(() =>
    flattenMatrix(IDENTITY_MATRIX())
  );
  const relativeTo = useRef<HTMLDivElement>(null);

  useTiltUpdates(
    active,
    relativeTo,
    setTilt,
    setTiltResetMatrix,
    sensorScale,
    maxTilt,
    options
  );

  return {
    /** The element to monitor mouse hover relative to */
    relativeTo,
    /**
     * The matrix that represents the original tilt, so it can be used with the tilt prop to tilt relative to the user
     * Use it on css like so transform: matrix3d(tiltResetMatrix.join(",")) rotateX(tilt.x) rotateY(tilt.y)
     */
    tiltResetMatrix,

    /**
     * How much tilt should be applied based
     */
    tilt,
  };
}

export function calculateDistanceRelativeToBounds(
  mousePosition: number,
  elementInitialPosition: number,
  elementSizeDimension: number,
  shouldRound: boolean
) {
  const normalizeInitialPosition = mousePosition - elementInitialPosition;
  const doNotAllowGoingBeyondLowerLimit = Math.max(normalizeInitialPosition, 0);
  const doNotAllowHoingBeyondHigherLimit = Math.min(
    doNotAllowGoingBeyondLowerLimit,
    elementSizeDimension
  );
  const threeRule =
    (doNotAllowHoingBeyondHigherLimit * 100) / elementSizeDimension;
  const result = (shouldRound ? Math.round(threeRule) : threeRule) / 100;
  return result;
}

export function givenTheRelativePositionHowMuchToRotate(
  relativePosition: number,
  maxRotation: number
) {
  return relativePosition * maxRotation - maxRotation / 2;
}
