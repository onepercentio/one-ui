import React, {
  ComponentProps,
  ElementRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import UncontrolledTransition from ".";
import Button from "../Button";
import { TransitionAnimationTypes } from "../Transition/Transition";
import StoriesStyles from "./UncontrolledTransition.stories.module.scss";

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
        transitionType={TransitionAnimationTypes.POP_FROM_CLICK_ORIGIN}
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

export const AnchorBasedTransition = (
  args: ComponentProps<typeof UncontrolledTransition>
) => {
  const transRef =
    useRef<React.ElementRef<typeof UncontrolledTransition>>(null);
  const [nextPage, setNextPage] = useState(false);
  const CurrentPage = () => {
    if (!nextPage)
      return (
        <React.Fragment key={"currPage"}>
          <div
            className={StoriesStyles.animatedContainer}
            style={{
              width: 100,
              height: 100,
              color: "white",
              backgroundColor: "black",
              animationDelay: `${-(Date.now() % 5000)}ms`,
            }}
            id="anchor"
          >
            Anchor only present on page 1
          </div>
          <button
            onClick={() => setNextPage((a) => !a)}
            style={{ margin: "auto" }}
          >
            Click me
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
            Now here comes the cool part{" "}
          </h1>
          <button
            onClick={() => {
              setNextPage((a) => !a);
              transRef.current!.setOrientation("backward");
            }}
            style={{ marginLeft: "auto" }}
          >
            Click me to go back even though the anchor does not exists anymore
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
        transitionType={TransitionAnimationTypes.POP_FROM_ELEMENT_ID}
        elementId={"anchor"}
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

export const FadeTransition = (
  args: ComponentProps<typeof UncontrolledTransition>
) => {
  const transRef =
    useRef<React.ElementRef<typeof UncontrolledTransition>>(null);
  const [nextPage, setNextPage] = useState(false);
  const CurrentPage = () => {
    if (!nextPage)
      return (
        <React.Fragment key={"currPage"}>
          <h1>First page</h1>
          <button
            onClick={() => setNextPage((a) => !a)}
            style={{ margin: "auto" }}
          >
            Change page
          </button>
        </React.Fragment>
      );
    else
      return (
        <React.Fragment key={"nextPage"}>
          <h1>Second page</h1>
          <button
            onClick={() => {
              setNextPage((a) => !a);
              transRef.current!.setOrientation("backward");
            }}
            style={{ margin: "auto" }}
          >
            Click me to go back
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
        transitionType={TransitionAnimationTypes.FADE}
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

export const BUGFIX_BackwardsInconsistency = () => {
  const [number, setNumber] = useState(10);
  const ref = useRef<ElementRef<typeof UncontrolledTransition>>(null);
  const prev = useRef(number);
  useLayoutEffect(() => {
    // Here is some logic that decides on demand if it should go backwards or not
    if (number < prev.current) ref.current?.setOrientation("backward");
    prev.current = number;
  }, [number]);

  return (
    <div>
      <UncontrolledTransition
        transitionType={TransitionAnimationTypes.CUSTOM}
        config={{
          backward: {
            elementExiting: StoriesStyles.outOfTheWay,
            elementEntering: StoriesStyles.fadeIn,
          },
          forward: {
            elementExiting: StoriesStyles.fadeOut,
            elementEntering: "",
          },
        }}
        ref={ref}
      >
        <h1 key={String(number)}>Número {number}</h1>
      </UncontrolledTransition>
      <Button
        onClick={() => {
          setNumber((prev) => prev - 1);
        }}
      >
        Go back with backwards inside useEffect (bugged as hell)
      </Button>
      <Button
        onClick={() => {
          ref.current?.setOrientation("backward");
          setNumber((prev) => prev - 1);
        }}
      >
        Go back setting backward <b>before</b> next screen (works fine)
      </Button>

      <Button onClick={() => setNumber((prev) => prev + 1)}>Go forward</Button>
    </div>
  );
};

ClickBasedTransition.args = {} as ComponentProps<typeof UncontrolledTransition>;
