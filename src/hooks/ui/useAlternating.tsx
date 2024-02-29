import { useEffect, useState } from "react";

/**
 * Receives a list and keeps alternating between the list elements every 5 seconds
 */
export default function useAlternating<X>(list: X[]) {
  const [current, setCurrent] = useState(list[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => {
        const currentIndex = list.indexOf(prev);
        if (list[currentIndex + 1]) return list[currentIndex + 1];
        else return list[0];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return current;
}
