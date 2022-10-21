import buildGrid from "./utils";
import Matter from "matter-js";
/**
 * DO NOT DARE TO USE THIS IF YOU HAVE A MINIMAL RESPECT FOR PERFORMANCE
 * 
 * Creates an svg that transitions from a square grid to rounded corners and them shrinks the balls to reveal the content
 * @param amountOfVerticalSquares The amount of squares vertically to be shown
 */
export default function PhysicsSquares(amountOfVerticalSquares: number = 10) {
  return function (el: HTMLDivElement) {
    const height = el.clientHeight;
    const width = el.clientWidth;
    const _ballsize = height / amountOfVerticalSquares;
    const maximumBalls = width / _ballsize;
    const amountOfBalls = Math.floor(maximumBalls);
    const gridData = buildGrid(
      amountOfVerticalSquares,
      amountOfBalls,
      _ballsize
    );
    const _time = getComputedStyle(el).getPropertyValue(
      "--animation-speed-transition"
    );
    const time = _time.endsWith("ms")
      ? Number(_time.replace("ms", ""))
      : Number(_time.replace("s", "")) * 1000;
    const canvas = document.createElement("canvas");
    canvas.width = el.clientWidth / 10;
    canvas.height = el.clientHeight / 10;
    // module aliases
    var Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Bodies = Matter.Bodies,
      Composite = Matter.Composite;

    // create an engine
    var engine = Engine.create();

    // create a renderer
    var render = Render.create({
      engine: engine,
      options: {
        wireframes: false,
        background: "black",
        height: el.clientHeight,
        width: el.clientWidth,
      },
      canvas: canvas,
      bounds: {
        min: {
          x: 0,
          y: 0,
        },
        max: {
          x: el.clientWidth,
          y: el.clientHeight,
        },
      },
    });
    var ground = Bodies.rectangle(0, el.clientHeight, el.clientWidth * 2, 10, {
      render: {
        fillStyle: "black",
      },
      angle: 0.1,
      isStatic: true,
    });

    const gridBodies = gridData.map((a) =>
      Bodies.circle(
        a.x + a.ballSize / 2 + (Math.random() * a.ballSize) / 2,
        a.y + a.ballSize / 2 + (Math.random() * a.ballSize) / 2,
        a.ballSize / 4 + (Math.random() * a.ballSize) / 4,
        {
          density: 0.1,
          render: {
            fillStyle: "black",
          },
        }
      )
    );

    // add all of the bodies to the world
    Composite.add(engine.world, [...gridBodies, ground]);

    // run the renderer
    Render.run(render);

    // create runner
    var runner = Runner.create();

    // run the engine
    Runner.run(runner, engine);

    const i = setInterval(() => {
      (
        el.firstElementChild! as HTMLDivElement
      ).style.webkitMaskImage = `url('${canvas!.toDataURL("base64")}')`;
    }, 1000 / 60);
    setTimeout(() => {
      clearInterval(i);
      Runner.stop(runner);
    }, time);
    return ``;
  };
}
