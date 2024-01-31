import React, { PropsWithChildren, useEffect, useMemo, useRef } from "react";
import useMergeRefs from "../../../hooks/useMergeRefs";
import useLavaLampSetup, { transitionPositionMs } from "../LavaLamp.data";
import Styles from "./LavaLamp.module.scss";
import { GuideOrb, Orb, OrbDrawer } from "../../../models/Orbs";

export default function LavaLamp({
  className,
  children,
}: PropsWithChildren<{ className: string }>) {
  const guideConfig = useRef<{
    x: number;
    y: number;
    posTimestamp: number;
    posIncrement: [x: number, y: number];

    size: number;
    sizeTimestamp: number;
    sizeIncrement: number;
  }>({
    size: 0,
    sizeTimestamp: Date.now(),
    sizeIncrement: 0,
    x: 0,
    y: 0,
    posTimestamp: Date.now(),
    posIncrement: [0, 0],
  });
  const { relativeTo, circlesConfig, d } = useLavaLampSetup(
    (x, y) => {
      guideConfig.current.posIncrement = [
        x - guideConfig.current.x,
        y - guideConfig.current.y,
      ];
      guideConfig.current.x = x;
      guideConfig.current.y = y;
      guideConfig.current.posTimestamp = Date.now();
    },
    (_size) => {
      const size = _size * 1.2;
      guideConfig.current.sizeIncrement =
        guideConfig.current.size === 0 ? 0 : size - guideConfig.current.size;
      guideConfig.current.size = size;
      guideConfig.current.sizeTimestamp = Date.now();
    }
  );
  const _canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useMergeRefs(
    _canvasRef,
    relativeTo as unknown as typeof _canvasRef
  );
  useEffect(() => {
    if (!d) return;
    const fc = canvasRef.current!;

    const baseColor =
      getComputedStyle(relativeTo.current!).getPropertyValue(
        "--digital-blue"
      ) || "#000000";

    var c = document.createElement("canvas"),
      w = (c.width = fc.width = d.width),
      h = (c.height = fc.height = d.height),
      ctx = c.getContext("2d")!,
      fctx = fc.getContext("2d")!, // f means final
      opts = {
        orbCount: circlesConfig.length,
        baseVel: Math.max(d.width * 0.001, 1),
        addedVel: Math.max(d.width * 0.001, 1),

        alphaThreshold: 200,
      },
      orbs = [] as (Orb | GuideOrb)[];
    class CanvasOrbDrawer implements OrbDrawer {
      protected gradient?: CanvasGradient;

      private newGradient(color: string, radius: number) {
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        gradient.addColorStop(0, `${color}ff`);
        gradient.addColorStop(0.8, `${color}cc`);
        gradient.addColorStop(1, `${color}00`);

        return gradient;
      }

      private oldDrawCircle(x: number, y: number, radius: number) {
        ctx.fillStyle = this.gradient ?? this.newGradient(baseColor, radius);
        ctx.translate(x | 0, y | 0);
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.translate(-x | 0, -y | 0);
      }
      drawOrb(x: number, y: number, radius: number) {
        this.oldDrawCircle(x, y, radius);
      }

      constructor(gradientRadius?: number) {
        if (gradientRadius)
          this.gradient = this.newGradient(baseColor, gradientRadius);
      }
    }

    let animFrame: number;
    function anim() {
      animFrame = window.requestAnimationFrame(anim);

      ctx.clearRect(0, 0, w, h);
      fctx.fillStyle = "#0000";
      fctx.fillRect(0, 0, w, h);

      for (var i = 0; i < orbs.length; i++) {
        const thisOrb = orbs[i];
        if (thisOrb instanceof Orb) {
          thisOrb.step();
        } else {
          thisOrb.step(
            guideConfig.current!.size,
            guideConfig.current!.sizeIncrement,
            guideConfig.current!.sizeTimestamp,
            guideConfig.current.posTimestamp,
            guideConfig.current!,
            {
              x: guideConfig.current!.posIncrement[0],
              y: guideConfig.current!.posIncrement[1],
            }
          );
        }
      }

      var image = ctx.getImageData(0, 0, w, h),
        data = new Uint8Array(image.data.buffer);

      for (var i = 3; i < data.length; i += 4)
        data[i] /= data[i] < opts.alphaThreshold ? 6 : 1;

      fctx.putImageData(image, 0, 0);
    }

    function randomVelocity() {
      return (opts.baseVel + opts.addedVel * Math.random()) | 0;
    }
    const orbBounds = { width: w, height: h };

    for (let circleConfig of circlesConfig) {
      const radius = circleConfig.baseSize * 1.5;
      const randomRadius = (radius + (radius / 2) * Math.random()) | 0;
      const drawerInstance = new CanvasOrbDrawer(randomRadius);
      orbs.push(
        new Orb(drawerInstance, randomVelocity(), orbBounds, randomRadius)
      );
    }
    const guideOrbInstance = new GuideOrb(
      new CanvasOrbDrawer(),
      transitionPositionMs
    );
    let guideOrbAutoInstance: Orb;
    orbs.push(guideOrbInstance);

    canvasRef.current!.parentElement!.onmouseleave = () => {
      const indexOfGuide = orbs.indexOf(guideOrbInstance);
      if (indexOfGuide !== -1) {
        const drawerInstance = new CanvasOrbDrawer(guideOrbInstance.lastRadius);
        guideOrbAutoInstance = new Orb(
          drawerInstance,
          randomVelocity(),
          orbBounds,
          guideOrbInstance.lastRadius
        );
        guideOrbAutoInstance.radius = guideOrbInstance.lastRadius;
        guideOrbAutoInstance.x = guideOrbInstance.lastX;
        guideOrbAutoInstance.y = guideOrbInstance.lastY;
        orbs.splice(indexOfGuide, 1);
        orbs.push(guideOrbAutoInstance);
      }
    };
    canvasRef.current!.parentElement!.onmouseenter = () => {
      if (orbs.indexOf(guideOrbInstance) === -1) {
        orbs.push(guideOrbInstance);
        orbs.splice(orbs.indexOf(guideOrbAutoInstance), 1);
      }
    };

    anim();

    return () => {
      window.cancelAnimationFrame(animFrame);
    };
  }, [circlesConfig]);

  return (
    <div className={`${className} ${Styles.root}`}>
      <canvas ref={canvasRef} />
      <div>{children}</div>
    </div>
  );
}
