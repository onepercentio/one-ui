const res = `$mediumGray: #bababa;
$lightGray: #d6d6d6;
$spaceBlue: #0f113a;
$warningRed: #e84b4b;
$sunsetPink: #ff3e7d;
$darkestGray: #727272;
$gray: #0f113a;`
  .split("\n")
  .map((l) => {
    const vara = l.replace(
      /\$([a-z]+)([A-Za-z]*)(: )/,
      (_, first, last, ...a) => {
        const l = last ? `--${first}-${last.toLowerCase()}, ` : `--${first}, `;
        return l;
      }
    );
    return `${/\$([a-z]+)([A-Za-z]*)(: )/.exec(l)[0]}var(${vara.replace(
      ";",
      ""
    )});`;
  }).join("\n");

console.log(res);
