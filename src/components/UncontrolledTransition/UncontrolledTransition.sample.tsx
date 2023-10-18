import React from "react";
import UncontrolledTransition from "../UncontrolledTransition";
import Button from "../Button";
import { useState } from "react";

function colorGen() {
  return [255 * Math.random(), 255 * Math.random(), 255 * Math.random()];
}

export default function Example() {
  const [color, setColor] = useState(colorGen);
  const rgb = `rgb(${color.join(",")})`;
  return (
    <UncontrolledTransition>
      <div
        key={color.join("")}
        style={{
          width: "100vw",
          height: "100vh",
          backgroundColor: rgb,
          textAlign: "center",
        }}
      >
        <Button variant="filled" onClick={() => setColor(colorGen())}>
          Click to transition
        </Button>
        <h2>RGB</h2>
        <p>{color[0].toFixed(0)}</p>
        <p>{color[1].toFixed(0)}</p>
        <p>{color[2].toFixed(0)}</p>
      </div>
    </UncontrolledTransition>
  );
}
