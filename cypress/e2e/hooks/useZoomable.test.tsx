import { useEffect } from "react";
import useZoomable from "../../../src/hooks/ui/useZoomable";

it("Should be able to zoom in and out", () => {
  function Wrapper({ width, height }: { width: number; height: number }) {
    const { zoomableEl } = useZoomable(`${width}-${height}`);
    useEffect(() => {});
    return (
      <div style={{ width, height }}>
        <button
          ref={zoomableEl}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            backgroundColor: "red",
          }}
        />
      </div>
    );
  }

  cy.mount(
    <>
      <Wrapper width={100} height={200} />
      <Wrapper height={100} width={300} />
    </>
  )
    .document()
    .then((document) => {
      document.body.style.setProperty("--animation--speed-fast", "10s");
      console.clear();
    })
    .get("button")
    .first()
    .click()
    .wait(1000);
  cy.get("button").last().click().wait(1000);
  cy.get("[data-zoomable-hero-clone]").should("have.length", 0);
});
