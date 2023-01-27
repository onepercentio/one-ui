/**
 *
 * @returns A hook to obtain the query params from a url
 */

import { useMemo } from "react";
import { useLocation } from "react-router-dom";

export default function useQuery<E extends {}>() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]) as unknown as {
    get: (p: keyof E) => E[typeof p];
  };
}
