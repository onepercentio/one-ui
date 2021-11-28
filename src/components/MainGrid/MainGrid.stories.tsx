import React, { ElementRef, useEffect, useRef, useState } from "react";
import MainGrid from "./MainGrid";

export default {
  component: MainGrid,
  title: "Main grid",
};
export const Primary = (args: any) => <MainGrid {...args} />;
Primary.args = {
  children: <h1>Example content</h1>,
  leftContent: <h1>Example left content</h1>,
} as Partial<React.ComponentProps<typeof MainGrid>>;

export const TestingTransition = () => {
  const [counter, setCounter] = useState(30);
  const ref = useRef<ElementRef<typeof MainGrid>>(null);

  useEffect(() => {
    window.addEventListener("keydown", ({ key }) => {
      if (key === "ArrowRight") setCounter((a) => a + 1);
      else if (key === "ArrowLeft") {
        ref.current!.setOrientation("backward");
        setCounter((a) => a - 1);
      }
    });
  }, []);

  const tenth = Math.floor(counter / 10);

  return (
    <>
      <h1 key={counter}>
        {counter} Press any key to increment the counter and change state
      </h1>
      <MainGrid
        ref={ref}
        leftContent={
          tenth % 2 === 0 ? (
            <h1 key={tenth}>{tenth} This shows only on multiples of 20</h1>
          ) : undefined
        }
      >
        <h1 key={String(tenth)}>{tenth} This increments on multiples of 10</h1>
      </MainGrid>
    </>
  );
};
