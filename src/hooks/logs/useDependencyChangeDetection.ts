import { useEffect, useRef } from "react";

export default function useDependencyChangeDetection(
  tag: string,
  dependencyArray: any[]
) {
  for (let dependencyIndex in dependencyArray) {
    const prevValue = useRef<any>();
    useEffect(() => {
      if (!prevValue.current) return;
      if (process.env.NODE_ENV === "development")
        require('../../models/DebugLogger').default(
          `${useDependencyChangeDetection.name}:${tag}`,
          `Element index ${dependencyIndex} (prev: ${JSON.stringify(
            prevValue.current
          )}) (new: ${JSON.stringify(
            dependencyArray[dependencyIndex]
          )}) has changed`
        );
    }, [dependencyArray[dependencyIndex]]);
    useEffect(() => {
      prevValue.current = dependencyArray[dependencyIndex];
    }, [dependencyArray[dependencyIndex]]);
  }
}
