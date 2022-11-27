import React, { CSSProperties, useEffect, useMemo } from "react";
import useTilt from "./useTilt";

export default {
  title: "hooks/useTilt",
};

const style: CSSProperties = {
  height: "20vh",
  width: "20vh",
  backgroundColor: "blue",
  color: "white",
};

const Wrapper = () => {
  const { relativeTo, tilt: initialTilt, tiltResetMatrix } = useTilt(true);
  const tilt = {
    x: initialTilt.x * 0.3,
    y: initialTilt.y * 0.3,
  }

  useEffect(() => {
    (relativeTo as any).current = document.body;
  }, []);
  const tiltStr = JSON.stringify(tilt, null, 4);
  const resetStr = JSON.stringify(tiltResetMatrix, null, 4);
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `body {
                background-color: yellow;
                height: 100vh;
            }`,
        }}
      />
      <h1>
        Move your mouse across the viewport and check the tilt or move you phone
        on mobile
      </h1>
      <h2>Using tilt prop</h2>
      <div
        style={{
          perspective: "600px",
          ...style,
          backgroundColor: "initial",
        }}
      >
        <div
          style={{
            ...style,
            transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
          }}
        >
          {tiltStr}
        </div>
      </div>
      <h2>Using tilt prop with reset matrix</h2>
      <div
        style={{
          perspective: "600px",
          ...style,
          backgroundColor: "initial",
        }}
      >
        <div
          style={{
            ...style,
            transform: `matrix3d(${tiltResetMatrix.join(",")}) rotateX(${
              tilt.x
            }deg) rotateY(${tilt.y}deg)`,
          }}
        >
          {tiltStr}
          <p>reset</p>
          {resetStr}
        </div>
      </div>
    </>
  );
};

export const BasicUsage = () => {
  return <Wrapper />;
};
