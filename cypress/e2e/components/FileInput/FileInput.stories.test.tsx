import React, { ComponentProps, useState } from "react";
import { mount } from "cypress/react";
import * as AllExamples from "../../../../src/components/FileInput/FileInput.stories";
import OneUIProvider, {
  OneUIContextSpecs,
} from "../../../../src/context/OneUIProvider";
import Compact from "../../../../src/components/FileInput/View/Compact/Compact";
import BigFactory from "../../../../src/components/FileInput/View/BigFactory/BigFactory";
import FileInput, {
  FileInputProps,
} from "../../../../src/components/FileInput/FileInput";
import MutableHamburgerButton from "../../../../src/components/MutableHamburgerButton/MutableHamburgerButton";

it("All examples mount at least", () => {
  for (let ExampleName in AllExamples) {
    if (ExampleName === "default") return;
    const Example = AllExamples[ExampleName];
    mount(<Example {...Example.args} />);
    cy.wait(500);
  }
});

const COMPONENTS_TO_TEST = {
  //   Big: BigFactory(() => <MutableHamburgerButton size={48} />),
  Compact: Compact,
};

const labels = {
  fileProvided: {
    title: "The file has been provided",
    description: "There is a description now",
    button: "Remove the file",
  },
  waitingFile: {
    title: "Why this file is needed",
    description: "Another description",
    button: "Submit a file",
  },
} as FileInputProps["states"];

for (let compName in COMPONENTS_TO_TEST) {
  const Component =
    COMPONENTS_TO_TEST[compName as keyof typeof COMPONENTS_TO_TEST];
  describe("Business rules for component " + compName, () => {
    function Wrapper({
      Component,
      ...props
    }: Omit<ComponentProps<typeof FileInput>, "onFile" | "file"> & {
      Component: OneUIContextSpecs["component"]["fileInput"]["View"];
    }) {
      const [providedFile, setProvidedFile] = useState<File>();
      return (
        <OneUIProvider
          config={{
            component: {
              fileInput: {
                View: Component,
              },
            },
          }}
        >
          <FileInput
            {...props}
            file={providedFile}
            onFile={(f) => setProvidedFile(f)}
          />
        </OneUIProvider>
      );
    }
    it("Should display states correctly", () => {
      cy.mount(
        <Wrapper
          states={labels}
          footer="A description about the files to be provided"
          Component={Component}
        />
      );
      if (compName !== "Compact") cy.contains(labels.waitingFile.button);
      cy.contains(labels.waitingFile.title);

      cy.get("input").attachFile({
        fileContent: "Some file content" as any,
        fileName: "Upload example.json",
        mimeType: "text/plain",
      });
      if (compName !== "Compact") cy.contains(labels.fileProvided.button);
      cy.contains(labels.fileProvided.title);

      switch (compName) {
        case "Compact":
          cy.get("svg").click();
          break;
        case "Big":
          cy.get("button").click();
          break;
      }
      if (compName !== "Compact") cy.contains(labels.waitingFile.button);
      cy.contains(labels.waitingFile.title);
    });
    it.only("Should be able to display progress", () => {
      cy.viewport(400, 200);
      const chain = cy.mountChain((progress?: number) => {
        cy.log(`Rendering progress ${progress}`);
        return (
          <Component
            states={labels}
            footer="XPTO"
            inputEl={null}
            onAction={() => {}}
            progress={progress}
            file={progress !== undefined ? ({} as any) : undefined}
          />
        );
      });
      chain.remount().wait(1000);
      chain.remount(25).wait(500);
      chain.remount(50).wait(500);
      chain.remount(75).wait(500);
      chain.remount(85).wait(500);
      chain.remount(90).wait(500);
      chain.remount(93).wait(500);
      chain.remount(99).wait(500);
      chain.remount(100).wait(500);
    });
  });
}
