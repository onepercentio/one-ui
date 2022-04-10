import React, { useEffect, useState } from "react";
import AdaptiveDialog from "./AdaptiveDialog";

export default {
  component: AdaptiveDialog,
  title: "Adaptive Dialog",
};

export const InitialImplementation = (args: any) => (
  <AdaptiveDialog {...args}>
    <p>Some content</p>
    <h1>ANs some more</h1>
    <h1>ANs some more</h1>
    <h1>ANs some more</h1>
    <h1>ANs some more</h1>
    <h1>ANs some more</h1>
    <h1>ANs some more</h1>
    <h1>ANs some more</h1>
  </AdaptiveDialog>
);
InitialImplementation.args = {
  open: true,
} as Partial<React.ComponentProps<typeof AdaptiveDialog>>;

export const Improvement_LockScrollWhenOpen = () => {
  const [o, so] = useState(false);

  return (
    <>
      <AdaptiveDialog open={o} onClose={() => so(false)}>
        <div
          style={{
            overflow: "auto",
          }}
        >
          {new Array(100).fill(undefined).map((_, i) => (
            <h1>
              Scrolling modal div item {i}{" "}
              <button onClick={() => so(false)}>click to close modal</button>
            </h1>
          ))}
        </div>
      </AdaptiveDialog>
      <div>
        {new Array(100).fill(undefined).map((_, i) => (
          <>
            <h1>
              Scrolling div item {i}{" "}
              <button onClick={() => so(true)}>click to open modal</button>
            </h1>
            {i == 24 ? (
              <div style={{ overflow: "auto", height: 40 }}>
                <h1>Nested scroll</h1>
                <h1>Nested scroll</h1>
                <h1>Nested scroll</h1>
                <h1>Nested scroll</h1>
                <h1>Nested scroll</h1>
                <h1>Nested scroll</h1>
                <h1>Nested scroll</h1>
                <h1>Nested scroll</h1>
                <h1>Nested scroll</h1>
                <h1>Nested scroll</h1>
                <h1>Nested scroll</h1>
                <h1>Nested scroll</h1>
              </div>
            ) : null}
          </>
        ))}
      </div>
    </>
  );
};

export const Improvement_LockFocusInsideModal = () => {
  const [o, oo] = useState(false);
  return (
    <>
      <h1>Here we have an input</h1>
      <input placeholder="This should not be focusable when I open the modal" />
      <button onClick={() => oo(true)}>Open modal</button>

      <AdaptiveDialog
        open={o}
        onClose={() => {
          oo(false);
        }}
      >
        <h1>Try pressing tab to switch focus</h1>
        <input placeholder="This should be focusable" />
      </AdaptiveDialog>
    </>
  );
};
