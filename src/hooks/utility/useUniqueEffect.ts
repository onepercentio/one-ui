import { useEffect, useMemo } from "react";
import { useShareState } from "../../context/ContextAsyncControl";

export default function useUniqueEffect(
  id: string,
  effect: () => void,
  deps: any[]
) {
  const lockId = useMemo(() => Math.random(), []);
  const [currLock, setCurrLock] = useShareState<number | undefined>(
    "unique-effect",
    id
  );
  useEffect(() => {
    if (currLock === lockId) effect();
  }, [...deps, currLock]);

  useEffect(() => {
    if (currLock === undefined) setCurrLock(lockId);
    if (currLock === lockId) return () => setCurrLock(undefined);
  }, [currLock]);
}
