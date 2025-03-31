import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useAsyncControl from "./useAsyncControl";
import throttle from "lodash/throttle";

type UpdateEvent<I extends any> = {
  finished: boolean;
  items: I[];
  totalItems: number;
};

export default function usePagination<I extends any>(
  request: (
    page: number,
    pageSize: number | "all",
    currItems?: I[]
  ) => Promise<UpdateEvent<I>>,
  paginationId: object | any[] | (() => string) = () => "default",
  startingItems?: I[]
): Paginable<I> {
  const paginationDataRef = useRef<{
    [d: string]:
      | {
          finished: boolean;
          totalItems: number;
        }
      | undefined;
  }>({});
  const { current: paginationData } = paginationDataRef;
  const paginationIdFactory = useMemo(
    () => {
      if (typeof paginationId === "object") {
        const randId = Math.random();
        return () => randId.toString();
      } else return paginationId;
    },
    Array.isArray(paginationId) ? paginationId : [paginationId]
  );

  const [items, setItems] =
    useState<[paginationId: string, items: I[]] | undefined>();

  const [id, setId] = useState(() => paginationIdFactory());

  useEffect(() => {
    setId(paginationIdFactory());
    if (startingItems) setItems([paginationIdFactory(), startingItems]);
    else setItems(undefined);
  }, [paginationIdFactory()]);

  const { process, ...control } = useAsyncControl();

  function updateItems(cb: (prevItems?: I) => UpdateEvent<I>["items"]) {
    setItems((prev) => [prev![0], cb()]);
  }

  const derivateCurrentPage = (pageSize: number) => {
    if (items === undefined) return 0;
    const currentPage = Math.floor((items?.[1].length ?? 0) / pageSize) - 1;
    return currentPage;
  };

  const _requestPage = useCallback(
    function (page: number, pageSize: number | "all") {
      const id = paginationIdFactory();
      if (paginationData[id]?.finished) return;
      process(async () => {
        const result = await request(
          page,
          pageSize,
          items?.[0] === id && page !== 0
            ? pageSize === "all"
              ? undefined
              : items?.[1].slice(0, page * pageSize)
            : undefined
        );
        paginationData[id] = {
          finished: result.finished,
          totalItems: result.totalItems,
        };
        setItems((prev) => {
          if (page === 0) return [id, result.items];
          else if (!prev || id === prev[0]) return [id, result.items];
          return prev;
        });
      });
    },
    [items, request]
  );

  return {
    updateItems,
    getNextPage: (pageSize: number) => {
      _requestPage(derivateCurrentPage(pageSize) + 1, pageSize);
    },
    getPage: _requestPage,
    getAll: () => {
      _requestPage(0, "all");
    },
    refreshCurrentPage: (pageSize: number) => {
      _requestPage(derivateCurrentPage(pageSize), pageSize);
    },
    totalItems: () => paginationData[paginationIdFactory()]?.totalItems,
    id: () => id,
    loading: control.loading,
    error: control.error,
    items: items?.[1],
    setError: control.setError,
  };
}

export type Paginable<I extends any, E extends any = any> = {
  updateItems: (cb: (prevItems?: I) => UpdateEvent<I>["items"]) => void;
  getNextPage: (pageSize: number) => void;
  refreshCurrentPage: (pageSize: number) => void;
  getPage: (page: number, pageSize: number) => void;
  getAll: () => void;
  totalItems: () => number | undefined;
  loading: boolean;
  error: E | Error | undefined;
  items: I[] | undefined;
  setError: ReturnType<typeof useAsyncControl>["setError"];
  id: () => string;
};

export type LocalPaginable<I extends any, E extends any = any> = Paginable<
  I,
  E
> & {
  src: I;
};

/**
 * This returns a ref to be bound to an elements so it can be able to detect when a pagination whould occur
 */
export function useContainerPagination(
  cb: (pageSize: number) => void,
  pageSize: number,
  direction: "h" | "v" = "v"
) {
  const scrollableRef = useRef<HTMLDivElement>();
  const customOptionsRef =
    useRef<() => { offsetBottom?: number; offsetLeft?: number }>();

  useEffect(() => {
    const el = scrollableRef.current!;
    const scrollElement =
      (el as unknown as typeof window.document).scrollingElement || el;
    const calculateIfReachedLimit = throttle(
      (e: Event) => {
        if (e.target !== el) return;
        const { offsetBottom = 0, offsetLeft = 0 } =
          customOptionsRef.current?.() || {};
        const offsetLimit =
          direction === "v"
            ? scrollElement.scrollHeight -
              offsetBottom -
              scrollElement.clientHeight * 0.6
            : scrollElement.scrollWidth -
              offsetLeft -
              scrollElement.clientWidth * 0.6;
        const offset =
          direction === "v"
            ? scrollElement.clientHeight + scrollElement.scrollTop
            : scrollElement.clientWidth + scrollElement.scrollLeft;
        if (offset >= offsetLimit) {
          cb(pageSize);
        }
      },
      250,
      {
        leading: false,
        trailing: true,
      }
    );

    el.addEventListener("scroll", calculateIfReachedLimit, {
      passive: true,
    });
    return () => el.removeEventListener("scroll", calculateIfReachedLimit);
  }, [cb, pageSize]);

  return {
    scrollableRef,
    customOptionsRef,
  };
}

/**
 * This function receives an amount of local instances and paginates it
 */
export function useLocalPagination<L>(items: L[] | undefined) {
  const instanceID = useMemo(() => Date.now(), [items]);
  const cb = useCallback(
    (page: number, pageSize: number | "all", currItems: L[] = []) => {
      if (!items)
        return Promise.resolve({
          finished: false,
          totalItems: 0,
          items: [],
        });
      if (pageSize === "all") pageSize = items.length;
      const from = pageSize * page;
      const newArray = [...currItems, ...items.slice(from, from + pageSize)];

      return Promise.resolve({
        finished: newArray.length === items.length,
        totalItems: items.length,
        items: newArray,
      });
    },
    [items]
  );
  const pagination = usePagination<L>(cb, () => `${instanceID}`);
  const pagSrc = useMemo(() => items, [pagination.items]);

  return {
    ...pagination,
    loading: items === undefined,
    src: pagSrc,
  };
}
