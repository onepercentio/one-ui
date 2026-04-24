jest.mock("loader-utils", () => ({
  getOptions: jest.fn(() => ({})),
  parseQuery: jest.fn(() => ({})),
  interpolateName: jest.fn(() => "static/media/icon.png"),
}));

jest.mock("sharp", () => {
  return jest.fn(() => ({
    resize: jest.fn().mockReturnThis(),
    sharpen: jest.fn().mockReturnThis(),
    png: jest.fn().mockReturnThis(),
    toBuffer: jest.fn((callback) => {
      callback(null, Buffer.from("png-binary"), {
        width: 32,
        height: 32,
      });
    }),
  }));
});

const svgToPngLoader = require("./svg-to-png").default;

function runLoader(context) {
  return new Promise((resolve, reject) => {
    svgToPngLoader.call(
      {
        resourceQuery: "",
        rootContext: "/repo",
        resourcePath: "/repo/assets/icon.svg",
        emitFile: jest.fn(),
        async() {
          return (error, result) => {
            if (error) {
              reject(error);
              return;
            }

            resolve({
              result,
              emitFile: this.emitFile,
            });
          };
        },
        ...context,
      },
      "<svg />"
    );
  });
}

it("exports an asset URL by default", async () => {
  const emitFile = jest.fn();
  const { result } = await runLoader({
    emitFile,
    _module: {
      resource: "/repo/assets/icon.svg",
    },
  });

  expect(emitFile).toHaveBeenCalledWith(
    "static/media/icon.png",
    Buffer.from("png-binary")
  );
  expect(result).toBe(
    'module.exports = __webpack_public_path__ + "static/media/icon.png";'
  );
});

it("exports a base64 data URL when imported from a .document.tsx entry", async () => {
  const emitFile = jest.fn();
  const documentModule = {
    resource: "/repo/src/mail.document.tsx",
  };
  const assetModule = {
    resource: "/repo/assets/icon.svg",
  };

  const { result } = await runLoader({
    emitFile,
    _module: assetModule,
    _compilation: {
      moduleGraph: {
        getIssuer(module) {
          if (module === assetModule) {
            return documentModule;
          }

          return null;
        },
      },
    },
  });

  expect(emitFile).not.toHaveBeenCalled();
  expect(result).toBe(
    'module.exports = "data:image/png;base64,cG5nLWJpbmFyeQ==";'
  );
});