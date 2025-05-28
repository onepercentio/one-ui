import { useInsertionEffect, useRef } from "react";

export default function useDepChange<T>(callback: (prevDep: T) => void, dep: T) {
  const prevStep = useRef<T>(undefined);
  useInsertionEffect(() => {
    if (prevStep.current) callback(prevStep.current);
    return () => {
      prevStep.current = dep;
    };
  }, [dep]);
}
