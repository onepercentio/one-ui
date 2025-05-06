import AdaptiveContainer from "components/AdaptiveContainer";
import { ReactElement, ReactNode } from "react";
const s = () =>
  [
    <div
      key="small"
      style={{ width: "100vw", height: "100px", backgroundColor: "blue" }}
    >
      <h1>SMALL</h1>
      <h1>SMALL</h1>
    </div>,
    (Math.random() * 1028390172).toFixed(0),
  ] as const;
const b = () =>
  [
    <div
      key="big"
      style={{ width: "100vw", height: "300px", backgroundColor: "red" }}
    >
      <h1>BIG</h1>
      <h1>BIG</h1>
      <h1>BIG</h1>
      <h1>BIG</h1>
      <h1>BIG</h1>
      <h1>BIG</h1>
      <h1>BIG</h1>
      <h1>BIG</h1>
      <h1>BIG</h1>
    </div>,
    (Math.random() * 1028390172).toFixed(0),
  ] as const;
const time = 100;
it("Should be able to remount any amou t of times", () => {
  console.clear();
  cy.viewport(200, 2000);
  const chain = cy.mountChain((c: ReactElement) => {
    return (
      <>
        <h1>HEAD</h1>
        <AdaptiveContainer direction="v" strict={false}>
          {c}
        </AdaptiveContainer>
        <h1>FOOTER</h1>
      </>
    );
  });

  for (let i of new Array(100).fill(undefined)) {
    chain
      .remount(<h1 key={"/first"}>FIRST</h1>)
      .wait(Math.random() * 200)
      .remount(<h2 key={"/second"}>SECOND</h2>)
      .wait(Math.random() * 200)
      .remount(<h2 key={"/third"}>THIRD</h2>);
    cy.contains("THIRD").wait(1000);
  }
});
