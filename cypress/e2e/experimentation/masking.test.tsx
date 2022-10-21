import { mount } from "cypress/react";
import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";

function Wrapper() {
  const [m, sm] = useState("");
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let r = 0;
    let i = 0;
    setInterval(() => {
      el.current!.addEventListener("animationiteration", () => {
        console.log("This calls?");
      });
      el.current!.addEventListener("animationstart", () => {
        console.log("This calls too");
      });
      el.current!.style.webkitMaskImage = `url('data:image/svg+xml;charset=utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg">
    <circle cx="50%" cy="50%" fill="white">
        <animate 
            attributeName="r" 
            attributeType="XML" 
            values="10%;75%;10%" 
            dur="2s" 
            repeatCount="indefinite" 
            begin="-0.5s" />
    </circle>
</svg>`)}')`;
    }, 1000 / 60);
  }, []);
  return (
    <>
      <div
        ref={el}
        style={{
          position: "absolute",
          width: 1000,
          height: 1000,
          backgroundColor: "blue",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 72,
          WebkitMaskImage: `url('data:image/svg+xml;charset=utf8,${m}')`,
        }}
      >
        <h1>THIS IS A TEXT</h1>
      </div>
    </>
  );
}

it("Should mask 2 elements", () => {
  cy.viewport(1096, 1096);
  mount(
    <>
      <div
        style={{
          width: 1000,
          margin: 48,
          height: 1000,
          position: "relative",
          backgroundColor: "red",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 1000,
            height: 1000,
            backgroundColor: "green",
          }}
        />
        <Wrapper />
      </div>
    </>
  );
});

it.only("Should be able to instance matterjs", () => {
  function W() {
    const el = useRef<HTMLDivElement>(null);
    useEffect(() => {
      const canvas = document.createElement("canvas");
      canvas.width = el.current!.clientWidth / 10;
      canvas.height = el.current!.clientHeight / 10;
      // module aliases
      var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Bodies = Matter.Bodies,
        Composite = Matter.Composite;

      // create an engine
      var engine = Engine.create({});

      // create a renderer
      var render = Render.create({
        engine: engine,
        options: {
          wireframes: false,
          background: "black",
          height: el.current!.clientWidth,
          width: el.current!.clientHeight,
        },
        canvas: canvas,
      });

      // create two boxes and a ground
      var boxA = Bodies.rectangle(400, 200, 80, 80, {
        density: 0.1,
        render: {
          fillStyle: "black",
          lineWidth: 0,
        },
      });
      var boxB = Bodies.rectangle(450, 50, 80, 80, {
        density: 1,
        render: {
          fillStyle: "black",
          lineWidth: 0,
        },
      });
      var ground = Bodies.rectangle(400, 610, 810, 10, {
        render: {
          fillStyle: "black",
        },
        isStatic: true,
      });

      // add all of the bodies to the world
      Composite.add(engine.world, [boxA, boxB, ground]);

      // run the renderer
      Render.run(render);

      // create runner
      var runner = Runner.create();

      // run the engine
      Runner.run(runner, engine);
      setInterval(() => {
        el.current!.style.webkitMaskImage = `url('${canvas!.toDataURL(
          "base64"
        )}')`;
      }, 1000 / 60);
    }, []);
    return (
      <>
        <div
          ref={el}
          style={{
            position: "absolute",
            width: 1000,
            height: 1000,
            backgroundColor: "blue",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 72,
          }}
        >
          <h1>THIS IS A TEXT</h1>
        </div>
      </>
    );
  }
  mount(<W />);
});
