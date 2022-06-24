import { useEffect, useLayoutEffect, useState } from "react";
import "./shims/ObjectWatchShim.js";

interface Object {
  watch<T extends Object>(prop: (keyof T)[], handler: () => void): () => void;
  unwatch(): void;
}

export default function useObserve<T extends any>(
  toObserve: T | T[],
  keysToObserve: (keyof T)[]
) {
  const [_, ss] = useState(0);
  useLayoutEffect(() => {    
    const arr = Array.isArray(toObserve) ? toObserve : [toObserve]
    for (let object of arr)
      return (object as Object).watch(keysToObserve as any, () => {
        ss((p) => {
          return p + 1
        });
      });
  }, [toObserve]);
}
