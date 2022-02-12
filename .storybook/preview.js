import "./styles.css";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

export const decorators = [
  (Story) => (
    <div style={{ "--main-font": "monospace", "--second-font": "monospace" }}>
      <link
        href="https://fonts.googleapis.com/css?family=Open+Sans:400,600,300"
        rel="stylesheet"
        type="text/css"
      />
      <link
        href="https://fonts.googleapis.com/css?family=Manrope:300,400,700"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css?family=Roboto:300,400,700"
        rel="stylesheet"
      />
      <Story />
    </div>
  ),
];
