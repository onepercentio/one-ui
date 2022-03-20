const { extractVars } = require("./css-var-removal");

beforeEach(() => {
  jest.resetModules();
});

it("Should extract correct vars and values", () => {
  const vars = extractVars(`--digital-blue: #6c4acc;--abc: var(--var-nao-definida);--var-nao-definida: red;`);

  expect(vars).toEqual(
    expect.objectContaining({
      "--digital-blue": "#6c4acc",
      "--var-nao-definida": "red",
      "--abc": "red"
    })
  );
});
