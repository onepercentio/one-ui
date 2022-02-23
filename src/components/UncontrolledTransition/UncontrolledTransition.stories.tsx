import React, { ComponentProps, useRef, useState } from "react";
import UncontrolledTransition from ".";
import { TransitionAnimationTypes } from "../Transition/Transition";

export default {
  title: "Uncontrolled Transition",
  component: UncontrolledTransition,
};

export const ClickBasedTransition = (
  args: ComponentProps<typeof UncontrolledTransition>
) => {
  const transRef =
    useRef<React.ElementRef<typeof UncontrolledTransition>>(null);
  const [nextPage, setNextPage] = useState(false);
  const CurrentPage = () => {
    if (!nextPage)
      return (
        <React.Fragment key={"currPage"}>
          <h1
            style={{
              display: "flex",
            }}
          >
            Current page{" "}
            <button
              onClick={() => setNextPage((a) => !a)}
              style={{ marginLeft: "auto" }}
            >
              Click me to see a cool effect
            </button>
          </h1>
          <button
            onClick={() => setNextPage((a) => !a)}
            style={{ marginRight: "auto" }}
          >
            Hehe
          </button>
          <h2>Another text</h2>
          <button
            onClick={() => setNextPage((a) => !a)}
            style={{ margin: "auto" }}
          >
            Or me
          </button>
        </React.Fragment>
      );
    else
      return (
        <React.Fragment key={"nextPage"}>
          <h1
            style={{
              display: "flex",
            }}
          >
            Next page{" "}
            <button
              onClick={() => {
                setNextPage((a) => !a);
                transRef.current!.setOrientation("backward");
              }}
              style={{ marginLeft: "auto" }}
            >
              Click me to see a cool effect
            </button>
          </h1>
          <button
            onClick={() => {
              setNextPage((a) => !a);
              transRef.current!.setOrientation("backward");
            }}
            style={{ marginRight: "auto" }}
          >
            Hehe
          </button>
          <h2>Another text</h2>
          <button
            onClick={() => {
              setNextPage((a) => !a);
              transRef.current!.setOrientation("backward");
            }}
            style={{ margin: "auto" }}
          >
            Or me
          </button>
        </React.Fragment>
      );
  };
  return (
    <div
      style={{
        backgroundColor: "red",
        padding: "250px",
      }}
    >
      <UncontrolledTransition
        ref={transRef}
        transitionType={TransitionAnimationTypes.SLIDE}
        contentStyle={{
          backgroundColor: "white",
        }}
        {...args}
      >
        {CurrentPage()}
      </UncontrolledTransition>
    </div>
  );
};

ClickBasedTransition.args = {} as ComponentProps<typeof UncontrolledTransition>;
