import { useState } from "react";
import { CommonErrorCodes } from "../types";

export default function useAsyncControl<E extends CommonErrorCodes>() {
  const [error, setError] = useState<E>();
  const [loading, setLoading] = useState<boolean>(false);

  const _process = async (asyncFn: () => Promise<any>) => {
    try {
      setLoading(true);
      setError(undefined);
      await asyncFn();
    } catch (e) {
      if (process.env.NODE_ENV === "development") console.error(e);
      setError("UNEXPECTED_ERROR" as E);
    } finally {
      setLoading(false);
    }
  };

  return {
    process: _process,
    loading,
    error,
    setError,
    setLoading,
  };
}
