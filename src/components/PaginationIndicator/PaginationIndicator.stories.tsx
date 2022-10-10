import React, { ComponentProps, useRef } from "react";
import Indicator from "./PaginationIndicator";

export default {
  title: "Pagination indicator",
  component: Indicator,
};

export const InitialImplementation = (args: any) => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <>
      <h1>
        This div has width 300px and there are 20 pages with width 300px each
      </h1>
      <h3>Try to scroll</h3>
      <div
        ref={ref}
        style={{
          display: "flex",
          backgroundColor: "blue",
          width: "300px",
          overflow: "auto",
        }}
      >
        {new Array(20).fill(undefined).map((_, i) => (
          <h2
            style={{
              width: "300px",
              minWidth: "300px",
              background: "linear-gradient(to right, red,green,blue)",
            }}
          >
            Page {i + 1}
          </h2>
        ))}
      </div>
      <div
        style={{
          width: "300px",
        }}
      >
        <Indicator
          scrollableRef={ref}
          estimatedWidth={args.estimatedWidth}
          size={args.size}
        />
      </div>
    </>
  );
};
InitialImplementation.args = {
  size: 24,
} as Partial<ComponentProps<typeof Indicator>>;
