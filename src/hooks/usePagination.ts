import { useRef, useState } from "react";
import useAsyncControl from "./useAsyncControl";
import { CommonErrorCodes } from "../types";

export default function usePagination<I extends any, A extends any[]>(
  request: (
    page: number,
    currItems?: I,
    ...args: A
  ) => Promise<{ finished: boolean; items: I }>,
  paginationId: (...args: A) => string = () => "default"
): Paginable<I, A> {
  const finishedPaginationRef = useRef<{ [d: string]: boolean }>({});
  const { current: finishedPagination } = finishedPaginationRef;

  const currentPageRef = useRef<{ [d: string]: number }>({});
  const { current: currentPage } = currentPageRef;

  const [items, setItems] = useState<I>();
  const { process, ...control } = useAsyncControl();

  function _requestPage(page: number, ...args: A) {
    const id = paginationId(...args);
    if (finishedPagination[id] || control.loading) return;
    process(async () => {
      const result = await request(page, items, ...args);
      currentPage[id] = page;
      finishedPagination[id] = result.finished;
      setItems(result.items);
    });
  }

  return {
    getNextPage: (...args: A) =>
      _requestPage((currentPage[paginationId(...args)] || 0) + 1, ...args),
    getPage: _requestPage,
    loading: control.loading,
    error: control.error,
    items,
  };
}

export type Paginable<I extends any, A extends any[] = []> = {
  getNextPage: (...args: A) => void;
  getPage: (page: number, ...args: A) => void;
  loading: boolean;
  error: CommonErrorCodes | undefined;
  items: I | undefined;
};
