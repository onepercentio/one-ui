import { existsSync, readdirSync, statSync } from "fs";
import { resolve } from "path";
import { ComponentDoc, parse } from "react-docgen-typescript";
const chalk = require("chalk") as typeof import("chalk");

function iterateOverComponentFolder(componentsFolder: string): ComponentDoc[] {
  const allComponents = readdirSync(componentsFolder);

  const comps = allComponents.reduce((r, c) => {
    const componentFolder = resolve(componentsFolder, c);
    if (c === "utilitary") {
      const parsedComponents = iterateOverComponentFolder(
        resolve(componentFolder)
      );
      return [...r, ...parsedComponents];
    } else {
      console.log("Parsing", c);
      const exportedFunctions = parse(
        existsSync(resolve(componentFolder, `${c}.tsx`))
          ? resolve(componentFolder, `${c}.tsx`)
          : resolve(componentFolder, `${c}.logic.tsx`)
      );
      const parsedComponent =
        exportedFunctions.find((el) => el.displayName === c) ||
        exportedFunctions[0];
      if (!parsedComponent) {
        console.log(chalk.red(`Component ${c} could not be parsed`));
        return r;
      }
      if (!parsedComponent.description)
        console.log(chalk.red(`Component ${c} doesn't have a description`));
      return [...r, parsedComponent];
    }
  }, [] as ComponentDoc[]);

  return comps;
}

const components = iterateOverComponentFolder(
  resolve(__dirname, "..", "src", "components")
);

console.log(
  JSON.stringify(
    components.map((a) => ({
      name: a.displayName,
      description: a.description,
    })),
    null,
    4
  )
);
