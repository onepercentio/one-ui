import { useEffect, useState } from "react";
import useAsyncControl from "../useAsyncControl";

/**
 * It can assume 3 states
 * [undefined] = The hook has just initialized, and will call the memoize function
 * [T] = The hook initialized the value
 * [null, error] = The hook failed to initialize and the error is available
 */
export default function useAsyncMemo<T>(
  funcToMemoize: () => Promise<T>,
  depArr: any[]
): [
  value: T | undefined | null,
  error: any,
  loading: boolean,
  retry: () => Promise<void>,
  setValue: (value: T) => void
] {
  const { process, error, ...control } = useAsyncControl();
  const [memo, setMemo] = useState<T | null>();

  useEffect(() => {
    let depBasedSet: typeof setMemo | undefined = setMemo;
    process(funcToMemoize)
      .then((whatToStore) => depBasedSet?.(() => whatToStore))
      .catch(() => depBasedSet?.(null));
    return () => {
      depBasedSet = undefined;
    };
  }, depArr);

  return [
    memo,
    error,
    control.loading,
    () =>
      process(funcToMemoize)
        .then((whatToStore) => setMemo(() => whatToStore))
        .catch(() => setMemo(null)),
    setMemo,
  ];
}
