import { useEffect, useState } from "react";

/**
 * This callback should return a boolean that indicates if the pooling has finished (true) or it should continue (false)
 */
type PoolingAction = () => Promise<boolean>;

/**
 * A hook that helps repeatedly check for updates at set intervals.
 * It runs a function over and over until it says it's done or stops.
 */
export default function usePooling(intervalMs = 1000, maxPoolingTime: number | null = 60000) {
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout>();
  const [failed, setFailed] = useState<boolean>(false);

  const cancelPooling = () => {
    if (intervalId) clearInterval(intervalId);
  }
  useEffect(
    () => cancelPooling,
    [intervalId]
  );

  return {
    failed,
    setFailed,
    isPooling: !!intervalId,
    /**
     * Start checking repeatedly by running your function.
     * Keep going until your function says it's finished or the check stops.
     * @param cb {@link PoolingAction} - Executes and returns if has finished (true) or not (false)
     */
    startPolling: (cb: PoolingAction) => {
      let poolingCount = 0;
      const maxPoolings = (maxPoolingTime !== null) ? Math.ceil(maxPoolingTime / intervalMs) : undefined;
      const intervalId = setInterval(async () => {
        poolingCount++;
        const finished = await cb();
        if (finished) setIntervalId(undefined);
        else if (poolingCount === maxPoolings) {
          setIntervalId(undefined);
          setFailed(true);
        }
      }, intervalMs);
      setIntervalId(intervalId);
      setFailed(false);
      return () => clearInterval(intervalId)
    },
    stop: cancelPooling,
  };
}