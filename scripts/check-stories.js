const { writeFileSync, existsSync, mkdirSync } = require("fs");
const { resolve, join } = require("path");

const compsPath = join(".", "src", "components");
const compsFolder = resolve(compsPath);

const dirs = require("fs").readdirSync(compsFolder);

const IGNORED_DIRS = ["utilitary", "HSForms", "WalletConnectionWrapper"];
const files = dirs
  .filter((dir) => !IGNORED_DIRS.includes(dir))
  .map((dir) => ({
    filePath: join(compsFolder, dir, `${dir}.stories.tsx`),
    testFilePath: join(
      ".",
      "cypress",
      "e2e",
      "components",
      dir,
      `${dir}.stories.test.tsx`
    ),
    comp: dir,
  }));

files.forEach(({ filePath, testFilePath, comp }, i) => {
  const testExists = existsSync(testFilePath);
  if (!testExists) {
    mkdirSync(join(testFilePath, ".."));
    writeFileSync(
      testFilePath,
      `import React from "react";
import { mount } from "cypress/react";
import * as AllExamples from "../../../../src/components/${comp}/${comp}.stories";

it("All examples mount at least", () => {
    for (let ExampleName in AllExamples) {
        if (ExampleName === 'default') return;
        const Example = AllExamples[ExampleName];
        mount(<Example {...Example.args}/>)
        cy.wait(500);
    }
})`
    );
  }
  const storyAlreadyExists = existsSync(filePath);
  if (!storyAlreadyExists)
    writeFileSync(
      filePath,
      `import React from "react";
import ${comp} from "./${comp}"

export default {
    title: '${comp.replace(/[A-Z]/g, (part) => " " + part).trim()}',
    component: ${comp},
};

export const InitialImplementation = (args: any) => (
    <${comp} {...args} />
);
`
    );
});
