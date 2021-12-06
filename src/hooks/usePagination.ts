import { useRef, useState } from "react";
import useAsyncControl from "./useAsyncControl";
import { CommonErrorCodes } from "../types";

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

  function _requestPage(page: number, ...args: A) {
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
  }

  return {
    updateItems,
    getNextPage: (...args: A) =>
      _requestPage((currentPage[paginationId(...args)] || 0) + 1, ...args),
    getPage: _requestPage,
    totalItems: (...args) => paginationData[paginationId(...args)]?.totalItems,
    loading: control.loading,
    error: control.error,
    items,
  };
}

export type Paginable<I extends any, A extends any[] = []> = {
  updateItems: (cb: (prevItems?: I) => UpdateEvent<I>["items"]) => void;
  getNextPage: (...args: A) => void;
  getPage: (page: number, ...args: A) => void;
  totalItems: (...args: A) => number | undefined;
  loading: boolean;
  error: CommonErrorCodes | undefined;
  items: I | undefined;
};
