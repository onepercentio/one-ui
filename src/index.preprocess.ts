import {
  fstat,
  fstatSync,
  lstatSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { join } from "path";

function preProcessIndex(indexPath: string) {
  const [_index, componentName] = indexPath.split("/").reverse();
  writeFileSync(
    indexPath,
    `export { default } from "./${componentName}";
export * from "./${componentName}";`
  );
}

let finalIndexTs = ``;

parseDir("./src");

function parseDir(path: string) {
  let folders = readdirSync(path);
  if (folders.includes("index.ts") || folders.includes("index.tsx")) {
    folders = folders.filter((f) => {
      const toCheck = join(path, f);
      if (f.includes("index.ts")) {
        preProcessIndex(toCheck);
        return true;
      } else {
        return lstatSync(toCheck).isDirectory();
      }
    });
  }
  for (let folder of folders) {
    const toCheck = join(path, folder);
    if (
      toCheck.endsWith(".d.ts") ||
      folder.startsWith("__") ||
      toCheck.includes(".DS_Store") ||
      folder.includes("storybook") ||
      folder.includes("preprocess") ||
      toCheck === "src/index.ts" ||
      toCheck === "src/test.ts" ||
      folder.endsWith(".scss") ||
      folder.endsWith(".svg") ||
      folder.endsWith(".md") ||
      folder.includes(".stories.") ||
      folder.includes(".test.") ||
      folder.includes("ObjectWatchShim") ||
      folder.includes("MasksFactory")
    )
      continue;
    if (lstatSync(toCheck).isDirectory()) {
      parseDir(toCheck);
    } else {
      const componentName = toCheck.includes("/index.ts")
        ? toCheck.includes("Form/v2/index")
          ? "FormV2"
          : toCheck.split("/").at(-2)
        : undefined;
      const isHook = toCheck.includes("hooks/");
      const isContext = toCheck.includes("context");
      const importPath = `${toCheck.replace("src", ".").replace(/\.tsx?/, "")}`;
      const extraExport =
        isHook || isContext
          ? `export {default as ${
              toCheck.split("/").at(-1)!.split(".")[0]
            }} from "${importPath}";\n`
          : componentName
          ? `export {default as ${componentName}} from "${importPath}"\n`
          : "";
      finalIndexTs += `export * from "${importPath}";
${extraExport}`;
    }
  }
}

writeFileSync("./src/index.ts", finalIndexTs);
