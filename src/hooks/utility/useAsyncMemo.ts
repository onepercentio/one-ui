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
): [T | undefined | null, any] {
  const { process, error } = useAsyncControl();
  const [memo, setMemo] = useState<T | null>();

  useEffect(() => {
    process(funcToMemoize)
      .then((whatToStore) => setMemo(() => whatToStore))
      .catch(() => setMemo(null));
  }, depArr);

  return [memo, error];
}
