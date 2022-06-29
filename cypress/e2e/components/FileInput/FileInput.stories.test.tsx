import React from "react";
import { mount } from "cypress/react";
import * as AllExamples from "../../../../src/components/FileInput/FileInput.stories";

it("All examples mount at least", () => {
    for (let ExampleName in AllExamples) {
        if (ExampleName === 'default') return;
        const Example = AllExamples[ExampleName];
        mount(<Example {...Example.args}/>)
        cy.wait(500);
    }
})