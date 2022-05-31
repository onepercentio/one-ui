import { useEffect, useLayoutEffect, useState } from "react";
import "./shims/ObjectWatchShim.js";

interface Object {
  watch<T extends Object>(prop: (keyof T)[], handler: () => void): () => void;
  unwatch(): void;
}

export default function useObserve<T extends any>(
  object: T,
  keysToObserve: (keyof T)[]
) {
  const [_, ss] = useState(0);
  useLayoutEffect(() => {
    return (object as Object).watch(keysToObserve as any, () => {
      ss((p) => p + 1);
    });
  }, [object]);
}
