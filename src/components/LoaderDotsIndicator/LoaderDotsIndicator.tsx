import React, { useEffect, useState } from "react";

/**
 * . .. ... . .. ...
 **/
export default function LoaderDotsIndicator({
  dotsCount = 3,
}: {
  dotsCount?: number;
}) {
  const [text, setText] = useState(".");
  useEffect(() => {
    const fullText = new Array(dotsCount).fill(".").join("");
    const intervalId = setInterval(() => {
      setText((a) => (a === fullText ? "." : a + "."));
    }, 250);

    return () => clearInterval(intervalId);
  }, [dotsCount]);

  return <>{text}</>;
}
