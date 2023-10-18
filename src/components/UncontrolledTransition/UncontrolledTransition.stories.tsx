import React, {
  ComponentProps,
  ElementRef,
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import UncontrolledTransition from ".";
import Button from "../Button";
import DiagonalReveal from "../Transition/MasksFactory/DiagonalReveal";
import PhysicsSquares from "../Transition/MasksFactory/PhysicsSquares";
import SquareToBalls from "../Transition/MasksFactory/SquareToBalls";
import { TransitionAnimationTypes } from "../Transition/Transition";
import StoriesStyles from "./UncontrolledTransition.stories.module.scss";
import DefaultSample from "./UncontrolledTransition.sample";

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

const firstEmoji = 0x1f604;
const emojisCount = 0x1f64f - firstEmoji;
function CoinFlipItem() {
  const [flippedTheCoin, setFlipped] = useState(() => Math.random() > 0.5);
  const [head, setHead] = useState(
    (0 + Math.floor(99 * Math.random())).toString()
  );
  const [tails, setTails] = useState(
    String.fromCodePoint(firstEmoji + Math.floor(emojisCount * Math.random()))
  );

  useEffect(() => {
    setTimeout(() => {
      setFlipped((prev) => !prev);
    }, 500 + Math.random() * 2000);
    return () => {
      if (flippedTheCoin)
        setHead((0 + Math.floor(99 * Math.random())).toString());
      else
        setTails(
          String.fromCodePoint(
            firstEmoji + Math.floor(emojisCount * Math.random())
          )
        );
    };
  }, [flippedTheCoin]);

  const CoinSide = () => (
    <div
      onClick={() => {
        setFlipped((prev) => !prev);
      }}
      style={{
        cursor: "pointer",
        width: "100px",
        height: "100px",
        borderRadius: "50px",
        backgroundColor: flippedTheCoin ? "red" : "green",
        fontSize: "60px",
        textAlign: "center",
        lineHeight: "100px",
        position: "relative",
      }}
    >
      {!flippedTheCoin ? head : tails}
    </div>
  );

  return (
    <>
      <UncontrolledTransition
        transitionType={TransitionAnimationTypes.COIN_FLIP}
        className={StoriesStyles.resetHeight}
      >
        <CoinSide key={!flippedTheCoin ? "heads" : "tail"} />
      </UncontrolledTransition>
    </>
  );
}
export const CoinFlip = ({ coinCount = 100 }: { coinCount?: number }) => {
  return (
    <>
      <h1>
        This story displays the animation of flipping between two elements on
        html
      </h1>
      <h2>This is more usefull with square elements</h2>

      <div style={{ display: "flex", flexWrap: "wrap", position: "relative" }}>
        {new Array(coinCount).fill(undefined).map(() => (
          <CoinFlipItem />
        ))}
      </div>
    </>
  );
};

export const MaskBasedTransition = () => {
  const [example, setExample] = useState<"coin" | "anchor">("coin");
  const ref = useRef<ElementRef<typeof UncontrolledTransition>>(null);
  return (
    <UncontrolledTransition
      ref={ref}
      className={StoriesStyles.maskExample}
      transitionType={TransitionAnimationTypes.MASK}
      maskFactory={SquareToBalls(20)}
    >
      {example === "coin" ? (
        <div key={example} className={StoriesStyles[example]}>
          <CoinFlip coinCount={20} />
          <Button
            variant="filled"
            onClick={() => {
              setExample("anchor");
            }}
          >
            Switch story
          </Button>
        </div>
      ) : (
        <div key={example} className={StoriesStyles[example]}>
          <AnchorBasedTransition />
          <Button
            variant="filled"
            onClick={() => {
              setExample("coin");
            }}
          >
            Back to coin story
          </Button>
        </div>
      )}
    </UncontrolledTransition>
  );
};
export const MaskBasedTransitionDiagonal = () => {
  const [example, setExample] = useState<"coin" | "anchor">("coin");
  const ref = useRef<ElementRef<typeof UncontrolledTransition>>(null);
  const salt = useMemo(() => Math.random().toString(), [example]);
  return (
    <UncontrolledTransition
      ref={ref}
      className={StoriesStyles.maskDiagonal}
      transitionType={TransitionAnimationTypes.MASK}
      maskFactory={DiagonalReveal}
    >
      {example === "coin" ? (
        <div key={example + salt} className={StoriesStyles[example]}>
          <CoinFlip coinCount={20} />
          <Button
            variant="filled"
            onClick={() => {
              setExample("anchor");
            }}
          >
            Switch story
          </Button>
        </div>
      ) : (
        <div key={example + salt} className={StoriesStyles[example]}>
          <AnchorBasedTransition />
          <Button
            variant="filled"
            onClick={() => {
              setExample("coin");
            }}
          >
            Back to coin story
          </Button>
        </div>
      )}
    </UncontrolledTransition>
  );
};

export const MaskBasedTransitionWithPhysics = () => {
  const [example, setExample] = useState<"coin" | "anchor">("coin");
  const ref = useRef<ElementRef<typeof UncontrolledTransition>>(null);
  useEffect(() => {
    setInterval(() => {
      setExample((p) => (p === "coin" ? "anchor" : "coin"));
    }, 10000);
  }, []);
  return (
    <UncontrolledTransition
      ref={ref}
      className={StoriesStyles.physicsExample}
      transitionType={TransitionAnimationTypes.MASK}
      maskFactory={PhysicsSquares(4)}
    >
      {example === "coin" ? (
        <div key={example} className={StoriesStyles[example]}>
          {/* <CoinFlip coinCount={20} /> */}
          <Button
            variant="filled"
            onClick={() => {
              setExample("anchor");
            }}
          >
            Switch story
          </Button>
        </div>
      ) : (
        <div key={example} className={StoriesStyles[example]}>
          {/* <AnchorBasedTransition /> */}
          <Button
            variant="filled"
            onClick={() => {
              setExample("coin");
            }}
          >
            Back to coin story
          </Button>
        </div>
      )}
    </UncontrolledTransition>
  );
};

export const OneSuggests_ExampleSample = () => {
  return <DefaultSample />;
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
