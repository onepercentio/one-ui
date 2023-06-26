import React from "react";
import { mount } from "cypress/react";

import { InitialImplementation as Component } from "components/LoopableVideo/LoopableVideo.stories";

it("Should be able to play the video", () => {
  cy.mount(
    <Component
      {...Component.args}
      videoSrc={`/__cypress/src${Component.args.videoSrc}`}
    />
  );
});
