import React, { CSSProperties, useEffect, useMemo, useRef } from "react";
import usePaginationControls from "./usePaginationControls";
import OneUIProvider from "../../context/OneUIProvider";

export default {
  title: "hooks/usePaginationControls",
};

const _ScrollWithTouch = () => {
  const ref = useRef(null);
  const { controls } = usePaginationControls(ref, {});
  const blocks = useMemo(() => {
    return new Array(10).fill(undefined).map(() => (
      <div
        style={{
          width: "75vw",
          minWidth: "75vw",
          height: "400px",
          backgroundColor: `rgb(${Math.floor(256 * Math.random())},${Math.floor(
            256 * Math.random()
          )},${Math.floor(256 * Math.random())})`,
        }}
      />
    ));
  }, []);
  return (
    <>
      <h1>
        Use your finger to scroll an notice how it snaps to the next element
      </h1>
      <div
        style={{
          width: "100vw",
          height: "400px",
          display: "flex",
          overflow: "auto",
        }}
        ref={ref}
      >
        {blocks}
      </div>
      {controls}
    </>
  );
};
export const ScrollWithTouch = () => (
  <OneUIProvider
    config={{
      hook: {
        ui: {
          usePaginationControls: {
            LeftControl: () => <button>To the left</button>,
            RightControl: () => <button>To the right</button>,
          },
        },
      },
    }}
  >
    <_ScrollWithTouch />
  </OneUIProvider>
);
