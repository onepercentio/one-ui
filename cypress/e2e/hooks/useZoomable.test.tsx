import { useEffect } from "react";
import useZoomable from "../../../src/hooks/ui/useZoomable";

it("Should be able to zoom in and out", () => {
  function Wrapper() {
    const { zoomableEl } = useZoomable();
    useEffect(() => {});
    return (
      <div style={{ width: 100, height: 100 }}>
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

  cy.mount(<Wrapper />)
    .get("button")
    .click()
    .wait(250)
    .document()
    .then((document) => {
      document.body.style.setProperty("--animation--speed-fast", "10s");
      console.clear();
    })
    .get("button")
    .last()
    .click()
    .wait(2000)
    .get("button")
    .last()
    .click()
    .wait(1000)
    .get("button")
    .last()
    .click()
    .wait(1000)
    .get("button")
    .last()
    .click();
});
