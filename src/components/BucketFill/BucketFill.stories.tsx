import React, { useEffect, useState } from "react";
import Button from "../Button";
import MutableHamburgerButton from "../MutableHamburgerButton";
import BucketFill, { IgnoreFill } from "./BucketFill";
import "./BucketFill.stories.module.scss";

export default {
  component: BucketFill,
  title: "Bucket Fill",
};

export const AutoFill = (args: any) => {
  const [fillTo, ss] = useState(0);

  useEffect(() => {
    const i = setInterval(() => {
      ss((a) => (a === 4 ? 0 : a + 1));
    }, 1000);

    return () => clearInterval(i);
  }, []);
  return (
    <>
      <h1>Filling to {fillTo}</h1>
      <div style={{ display: "flex" }}>
        <div>
          <BucketFill {...args} fillTo={fillTo} background="white">
            <h1>First step</h1>
            <div>
              <p>Second</p>
              <p>step</p>
            </div>
            <IgnoreFill>
              <Button variant="filled">Third step</Button>
            </IgnoreFill>
            <div>
              <MutableHamburgerButton state="loading" size={180} />
              <IgnoreFill>
                <Button>BADADADADAD</Button>
              </IgnoreFill>
              <p>Fourth step</p>
            </div>
          </BucketFill>
        </div>
        <div
          style={
            {
              background: "#000",
              color: "white",
              "--digital-blue": "white",
            } as any
          }
        >
          <div>
            <BucketFill {...args} fillTo={fillTo} background="#000">
              <h1>First step</h1>
              <div>
                <p>Second</p>
                <p>step</p>
              </div>
              <p>Third step</p>
              <div style={{}}>
                <MutableHamburgerButton state="loading" size={180} />
                Fourth step
              </div>
            </BucketFill>
          </div>
        </div>
        <div
          style={
            {
              background: "yellow",
              color: "black",
              "--digital-blue": "black",
            } as any
          }
        >
          <div>
            <BucketFill {...args} fillTo={fillTo} background="yellow">
              <h1>First step</h1>
              <div>
                <p>Second</p>
                <p>step</p>
              </div>
              <p>Third step</p>
              <div style={{}}>
                <MutableHamburgerButton state="loading" size={180} />
                Fourth step
              </div>
            </BucketFill>
          </div>
        </div>
        <div
          style={
            {
              background: "linear-gradient(to bottom, red, green, blue)",
              color: "black",
              "--digital-blue": "black",
            } as any
          }
        >
          <BucketFill
            {...args}
            fillTo={fillTo}
            background="linear-gradient(to bottom, red, green, blue)"
          >
            <h1>First step</h1>
            <div>
              <p>Second</p>
              <p>step</p>
            </div>
            <p>Third step</p>
            <div style={{}}>
              <MutableHamburgerButton state="loading" size={180} />
              Fourth step
            </div>
          </BucketFill>
        </div>
        <div
          style={
            {
              background: "linear-gradient(to right, red, green, blue)",
              color: "black",
              "--digital-blue": "black",
            } as any
          }
        >
          <BucketFill
            {...args}
            fillTo={fillTo}
            background="linear-gradient(to right, red, green, blue)"
          >
            <h1>First step</h1>
            <div>
              <p>Second</p>
              <p>step</p>
            </div>
            <p>Third step</p>
            <div style={{}}>
              <MutableHamburgerButton state="loading" size={180} />
              Fourth step
            </div>
          </BucketFill>
        </div>
      </div>
    </>
  );
};
AutoFill.args = {} as Partial<React.ComponentProps<typeof BucketFill>>;

export const Sandbox = (args: any) => {
  return (
    <>
      <div>
        <BucketFill {...args}>
          <h1>First step</h1>
          <div>
            <p>Second</p>
            <p>step</p>
          </div>
          <p>Third step</p>
          <div style={{}}>
            <Button>sajdnasnd</Button>
            <MutableHamburgerButton state="loading" size={180} />
            <p>Fourth step</p>
          </div>
        </BucketFill>
      </div>
    </>
  );
};
