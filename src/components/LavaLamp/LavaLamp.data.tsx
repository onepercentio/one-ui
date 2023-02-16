import { throttle as t } from "lodash";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTiltUpdates } from "../../hooks/ui/useTilt";
import Styles from "./LavaLamp.module.scss";

const transitionMs = Number(Styles.transitionMs);
export const transitionPositionMs = Number(Styles.transitionPositionMs);

export default function useLavaLampSetup(
  onUpdatePosition: (x: number, y: number) => void,
  onUpdateSize: (size: number) => void,
  scaleResolution: number = 1
) {
  const [d, setDim] = useState<{ width: number; height: number }>();
  const relativeTo = useRef<HTMLDivElement>(null);

  const prevTilt = useRef<{ x: number; y: number }>();

  useEffect(() => {
    setDim({
      width: relativeTo.current!.clientWidth * scaleResolution,
      height: relativeTo.current!.clientHeight * scaleResolution,
    });
  }, []);

  const updateTiltCb = useMemo(() => {
    const throttlePosition = t;
    if (!d) return () => {};
    const baseSize = Math.min(d.width, d.height) * 0.1;
    let acceleration = t(
      (currTilt: { x: number; y: number }) => {
        if (!prevTilt.current) {
          prevTilt.current = currTilt;
          return;
        }

        const diff = {
          x: Math.abs(prevTilt.current.x - currTilt.x),
          y: Math.abs(prevTilt.current.y - currTilt.y),
        };

        const baseDiff = Math.max(diff.x, diff.y);
        const percent = (baseDiff * 100) / 90;

        onUpdateSize(baseSize + baseSize * (percent / 100));

        prevTilt.current = currTilt!;
      },
      transitionMs,
      {
        leading: false,
        trailing: true,
      }
    );
    let movement = throttlePosition(
      (currTilt: { x: number; y: number }) => {
        const [x, y] = [currTilt.x + 100, currTilt.y + 100];
        const [cx, cy] = [(d!.width * x) / 200, (d!.height * y) / 200];
        onUpdatePosition(cx, cy);
      },
      transitionPositionMs,
      {
        leading: false,
        trailing: true,
      }
    );
    return (tilt: NonNullable<typeof prevTilt.current>) => {
      if (!d) return;
      acceleration(tilt);
      movement(tilt);
    };
  }, [d]);
  useTiltUpdates(
    true,
    relativeTo,
    updateTiltCb,
    undefined,
    undefined,
    undefined,
    {
      round: false,
      gyroEnabled: false,
    }
  );
  const circlesConfig = useMemo(() => {
    if (!d) return [];
    const baseSize = Math.min(d.width, d.height) * 0.15;
    return new Array(10).fill(undefined).map((_, i) => {
      const mod = i % 2;
      const startX =
        Math.random() * d.width * 0.5 + (mod === 0 ? 0 : d.width * 0.5);
      const translateX = startX - (startX + 50 + Math.random() * 200);
      const startY =
        Math.random() * d.height * 0.75 + (mod === 0 ? 0 : d.height * 0.25);
      const translateY = startY - (startY + 50 + Math.random() * 200);

      return {
        baseSize,
        startX,
        startY,
        translateX,
        translateY,
      };
    });
  }, [d]);

  return {
    relativeTo,
    d,
    circlesConfig,
  };
}
