import React, { ElementRef, useEffect, useRef, useState } from "react";
import MainGrid from "./MainGrid";

export default {
  component: MainGrid,
  title: "Main grid",
};

export const ExemploTransicao = () => {
  const [counter, setCounter] = useState(20);
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

  const tenth = Math.floor(counter / 5);

  return (
    <div
      style={{
        backgroundColor: "lightblue",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <h1 style={{ textAlign: "center" }} key={counter}>
        {counter} Press any key to increment the counter and change state
      </h1>
      <MainGrid
        ref={ref}
        leftContent={
          tenth % 2 === 0 ? (
            <h1 style={{backgroundColor: "lightsalmon"}} key={tenth}>{tenth} This shows only on multiples of 10</h1>
          ) : undefined
        }
        rightContent={
          Math.random() > 0.05  ? (
            <h1 style={{backgroundColor: "lightskyblue"}} key={tenth}>{tenth} And me??? I come and go in a chaotic manner</h1>
          ) : undefined
        }
      >
        <h1
          style={{ textAlign: "center", backgroundColor: "lightyellow" }}
          key={String(tenth)}
        >
          {tenth} This increments on multiples of 5
        </h1>
      </MainGrid>
    </div>
  );
};
