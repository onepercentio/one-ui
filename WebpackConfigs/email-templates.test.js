jest.mock(
  require("path").resolve("./webpack-email-config-factory"),
  () => jest.fn(),
  { virtual: true }
);

let logSpy;
let processSpy;
let promptSpy;
beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  processSpy = jest.spyOn(process, "exit").mockImplementation(() => {});
  promptSpy = jest
    .spyOn(require("inquirer"), "prompt")
    .mockImplementation(() => Promise.resolve());
  logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
});

it("Should generate the file correctly when using proprietary webpack config", async () => {
  require(require("path").resolve(
    "./webpack-email-config-factory"
  )).mockImplementation((...args) => ({
    config:
      require("@muritavo/webpack-microfrontend-scripts/bin/react/scripts/_webpackConfiguration").createBaseConfiguration(
        ...args
      ),
    baseHtml: "mock",
  }));
  await require("./email-templates")();
});

it.each(["development", "production"])(
  "Should work when using a react-scripts config",
  async (environment) => {
    require(require("path").resolve(
      "./webpack-email-config-factory"
    )).mockImplementation(() => ({
      config: require("react-scripts/config/webpack.config")(environment),
    }));
    await require("./email-templates")();
  }
);

it("Should warn the user when there are no templates mapped", async () => {
  require(require("path").resolve(
    "./webpack-email-config-factory"
  )).mockImplementation(() => ({
    config: require("react-scripts/config/webpack.config")("development"),
  }));
  await require("./email-templates")();
  expect(logSpy.mock.calls).toMatchSnapshot();
});
