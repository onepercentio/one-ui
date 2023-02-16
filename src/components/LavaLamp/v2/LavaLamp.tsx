import React, { PropsWithChildren, useEffect, useMemo, useRef } from "react";
import useBreakpoint from "../../../hooks/ui/useBreakpoint";
import useMergeRefs from "../../../hooks/useMergeRefs";
import useLavaLampSetup, { transitionPositionMs } from "../LavaLamp.data";
import Styles from "./LavaLamp.module.scss";

export default function LavaLamp({
  className,
  children,
}: PropsWithChildren<{ className: string }>) {
  const under800Px = useBreakpoint(800);
  const scale = useMemo(() => {
    return under800Px ? 1.5 : 1.8;
  }, [under800Px]);
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
    },
    scale
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
        baseVel: 1,
        addedVel: 1,

        alphaThreshold: 200,
      },
      orbs = [] as (Orb | GuideOrb)[];

    let animFrame: number;
    function anim() {
      animFrame = window.requestAnimationFrame(anim);

      ctx.clearRect(0, 0, w, h);
      fctx.fillStyle = "#0000";
      fctx.fillRect(0, 0, w, h);

      for (var i = 0; i < orbs.length; i++) orbs[i].step();

      var image = ctx.getImageData(0, 0, w, h),
        data = new Uint8Array(image.data.buffer);

      for (var i = 3; i < data.length; i += 4)
        data[i] /= data[i] < opts.alphaThreshold ? 6 : 1;

      fctx.putImageData(image, 0, 0);
    }

    class Orb {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      gradient: CanvasGradient;

      constructor(radius: number) {
        this.x = (Math.random() * w) | 0;
        this.y = (Math.random() * h) | 0;
        this.radius = (radius + (radius / 2) * Math.random()) | 0;

        var color = baseColor;
        this.gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
        this.gradient.addColorStop(0, `${color}ff`);
        this.gradient.addColorStop(0.8, `${color}cc`);
        this.gradient.addColorStop(1, `${color}00`);

        var radiant = Math.random() * Math.PI * 2,
          vel = (opts.baseVel + opts.addedVel * Math.random()) | 0;

        vel *= 0.5;

        this.vx = Math.cos(radiant) * vel;
        this.vy = Math.sin(radiant) * vel;
      }
      step() {
        this.x += this.vx;
        this.y += this.vy;

        var radius = this.radius / 2;

        if (this.x < -radius || this.x > w + radius) this.vx *= -1;

        if (this.y < -radius || this.y > h + radius) this.vy *= -1;

        ctx.fillStyle = this.gradient;
        ctx.translate(this.x | 0, this.y | 0);
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.translate(-this.x | 0, -this.y | 0);
      }
    }

    class GuideOrb {
      step() {
        const deltaTime = Date.now() - guideConfig.current.sizeTimestamp;
        const deltaTimePercent =
          deltaTime > 250 ? 1 : (deltaTime * 100) / 250 / 100;

        const radius =
          guideConfig.current.size -
          (guideConfig.current.sizeIncrement -
            guideConfig.current.sizeIncrement * deltaTimePercent);

        var color = baseColor;

        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        gradient.addColorStop(0, `${color}ff`);
        gradient.addColorStop(0.8, `${color}cc`);
        gradient.addColorStop(1, `${color}00`);

        const deltaTimePos = Date.now() - guideConfig.current.posTimestamp;
        const deltaTimePosPercent =
          deltaTimePos > transitionPositionMs
            ? 1
            : (deltaTimePos * 100) / transitionPositionMs / 100;

        const translateX =
          guideConfig.current.x -
          (guideConfig.current.posIncrement[0] -
            guideConfig.current.posIncrement[0] * deltaTimePosPercent);

        const translateY =
          guideConfig.current.y -
          (guideConfig.current.posIncrement[1] -
            guideConfig.current.posIncrement[1] * deltaTimePosPercent);

        ctx.fillStyle = gradient;
        ctx.translate(translateX | 0, translateY | 0);
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.translate(-translateX | 0, -translateY | 0);
      }
    }

    for (let circleConfig of circlesConfig)
      orbs.push(new Orb(circleConfig.baseSize * 1.5));
    orbs.push(new GuideOrb());

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
