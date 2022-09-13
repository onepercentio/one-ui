import { useCallback, useEffect, useRef, useState } from "react";
import useAsyncControl from "./useAsyncControl";
import throttle from "lodash/throttle";

type UpdateEvent<I extends any> = {
  finished: boolean;
  items: I;
  totalItems: number;
};

export default function usePagination<I extends any, A extends any[]>(
  request: (page: number, currItems?: I, ...args: A) => Promise<UpdateEvent<I>>,
  paginationId: (...args: A) => string = () => "default"
): Paginable<I, A> {
  const paginationDataRef = useRef<{
    [d: string]:
    | {
      finished: boolean;
      totalItems: number;
    }
    | undefined;
  }>({});
  const { current: paginationData } = paginationDataRef;

  const currentPageRef = useRef<{ [d: string]: number }>({});
  const { current: currentPage } = currentPageRef;

  const [items, setItems] = useState<I>();
  const { process, ...control } = useAsyncControl();

  function updateItems(cb: (prevItems?: I) => UpdateEvent<I>["items"]) {
    setItems(cb);
  }

  const _requestPage = useCallback(function (page: number, ...args: A) {
    const id = paginationId(...args);
    if (paginationData[id]?.finished || control.loading) return;
    process(async () => {
      const result = await request(page, items, ...args);
      currentPage[id] = page;
      paginationData[id] = {
        finished: result.finished,
        totalItems: result.totalItems,
      };
      setItems(result.items);
    });
  }, [items, request, control.loading])


  return {
    updateItems,
    getNextPage: (...args: A) =>
      _requestPage((currentPage[paginationId(...args)] || 0) + 1, ...args),
    getPage: _requestPage,
    totalItems: (...args) => paginationData[paginationId(...args)]?.totalItems,
    loading: control.loading,
    error: control.error,
    items,
    setError: control.setError
  };
}

export type Paginable<I extends any, A extends any[] = [], E extends any = any> = {
  updateItems: (cb: (prevItems?: I) => UpdateEvent<I>["items"]) => void;
  getNextPage: (...args: A) => void;
  getPage: (page: number, ...args: A) => void;
  totalItems: (...args: A) => number | undefined;
  loading: boolean;
  error: E | Error | undefined;
  items: I | undefined;
  setError: ReturnType<typeof useAsyncControl>["setError"];
};

/**
 * This returns a ref to be bound to an elements so it can be able to detect when a pagination whould occur
 */
export function useContainerPagination(cb: () => void) {
  const scrollableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollableRef.current!
    const calculateIfReachedLimit = throttle(() => {
      const offsetLimit = el.scrollHeight - el.clientHeight * 0.6;
      const offset = el.clientHeight + el.scrollTop;
      if (offset >= offsetLimit) {
        cb();
      }
    }, 250, {
      leading: false,
      trailing: true
    })

    el.addEventListener("scroll", calculateIfReachedLimit)
    return () => el.removeEventListener('scroll', calculateIfReachedLimit);
  }, [cb])

  return {
    scrollableRef
  }
}

/**
 * This function receives an amount of local instances and paginates it
 */
export function useLocalPagination<L>(items: L[], pageSize: number) {
  const cb = useCallback((page: number, currItems: L[] = []) => {
    const from = pageSize * page;
    const newArray = [...currItems, ...items.slice(from, from + pageSize)]
    return Promise.resolve({
      finished: newArray.length === items.length,
      totalItems: items.length,
      items: newArray
    });
  }, [pageSize])
  const pagination = usePagination<L[], []>(cb);

  return pagination
}