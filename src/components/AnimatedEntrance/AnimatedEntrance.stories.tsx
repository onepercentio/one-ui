import React, {
  ReactElement,
  useMemo,
  useRef,
  useState,
} from "react";
import Button from "../Button";
import AnimatedEntrance from "./AnimatedEntrance";

export default {
  component: AnimatedEntrance,
  title: "Animated Entrance",
};

const ExampleEL = (
  key: number,
  removeElCb: (cb: (els: ReactElement[]) => ReactElement[]) => void
) => {
  return (
    <div key={key}>
      Elemento {key}{" "}
      <Button
        variant={"outline"}
        onClick={() =>
          removeElCb((prev) => {
            const filteredOut = prev.filter(
              (prev) => String(prev.key) !== String(key)
            );
            return filteredOut;
          })
        }
      >
        Remove
      </Button>
    </div>
  );
};

export const InitialImplementation = (args: any) => {
  const [exampleElements, setE] = useState<ReactElement[]>([]);

  useMemo(() => {
    exampleElements.push(ExampleEL(1, setE));
    exampleElements.push(ExampleEL(2, setE));
    exampleElements.push(ExampleEL(3, setE));
    exampleElements.push(ExampleEL(4, setE));
  }, []);
  const counter = useRef(4);

  return (
    <>
      <div style={{ minHeight: 800 }}>
        <AnimatedEntrance>{exampleElements}</AnimatedEntrance>
      </div>
      <Button
        variant="filled"
        onClick={() =>
          setE((prev) => {
            counter.current++;
            const currCounter = counter.current;
            return [...prev, ExampleEL(currCounter, setE)];
          })
        }
      >
        Add element
      </Button>
    </>
  );
};
InitialImplementation.args = {} as Partial<
  React.ComponentProps<typeof AnimatedEntrance>
>;
