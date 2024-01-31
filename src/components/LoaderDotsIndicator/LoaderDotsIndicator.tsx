import React, { useEffect, useState } from "react";

/**
 * . .. ... . .. ...
 **/
export default function LoaderDotsIndicator({
  dotsCount = 3,
  lockSize = false,
}: {
  dotsCount?: number;
  /** Makes the dots so that they do not affect layout size */
  lockSize?: boolean;
}) {
  const [text, setText] = useState(".");
  useEffect(() => {
    const fullText = new Array(dotsCount).fill(".").join("");
    const intervalId = setInterval(() => {
      setText((a) => (a === fullText ? "." : a + "."));
    }, 250);

    return () => clearInterval(intervalId);
  }, [dotsCount]);

  return (
    <>
      {text}
      {lockSize && (
        <span style={{ color: "#0000" }}>
          {new Array(dotsCount - text.length).fill(".")}
        </span>
      )}
    </>
  );
}
