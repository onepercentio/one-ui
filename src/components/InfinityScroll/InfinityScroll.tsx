import React, {
  ForwardedRef,
  forwardRef,
  MutableRefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Styles from "./InfinityScroll.module.scss";

export function shouldIncrementPage(
  howMuchTheParentScrolled: number,
  prevSectionPosition: number,
  currSectionPosition: number,
  nextSectionPosition: number
): -1 | 0 | 1 {
  if (howMuchTheParentScrolled === nextSectionPosition) return 1;
  else if (howMuchTheParentScrolled === prevSectionPosition) return -1;
  else return 0;
}

export function keys(currPage: number) {
  return [currPage % 3, (currPage + 1) % 3, (currPage + 2) % 3]
    .map((a) => `step_${a}`)
    .reverse();
}

/**
 * Manages a set of divs that allows the effect of inifinite scrolling between pages
 **/
function InfinityScroll(
  {
    items,
    pageSize,
    initialPage = 0,
    pageClass,
    className = "",
  }: {
    items: (React.ReactElement | string)[];
    pageSize: number;
    initialPage?: number;
    pageClass?: string;
    className?: string;
  },
  ref: ForwardedRef<HTMLDivElement>
) {
  const [currPage, setCurrPage] = useState({
    page: initialPage,
    offset: 0,
  });
  const parentDiv = ref as MutableRefObject<HTMLDivElement>;
  const prevDiv = useRef<HTMLDivElement>(null);
  const currDiv = useRef<HTMLDivElement>(null);
  const nextDiv = useRef<HTMLDivElement>(null);

  const isCountTheSameOrLowerThanPage = items.length <= pageSize;

  function getItems(
    page: number,
    offset: number,
    _pageSize: number = pageSize
  ) {
    let from = page * _pageSize + offset;
    if (from < 0) from = items.length + from;
    if (from > items.length) from = from - items.length;
    const to = from + _pageSize;
    const slicedItems = items.slice(from, to);

    if (slicedItems.length < _pageSize && !isCountTheSameOrLowerThanPage) {
      slicedItems.push(...getItems(0, 0, _pageSize - slicedItems.length));
    }
    return slicedItems.map((i, index) =>
      typeof i === "object"
        ? {
            ...i,
            key: index,
          }
        : i
    );
  }

  useEffect(() => {
    if (isCountTheSameOrLowerThanPage) return;
    const viewportWidth = parentDiv.current!.clientWidth;
    const centerScroll = parentDiv.current!.scrollWidth / 2;
    parentDiv.current!.scrollTo({
      left: centerScroll - viewportWidth / 2,
    });
  }, [isCountTheSameOrLowerThanPage, currPage.page, currPage.offset]);
  const [beforeKey, currKey, afterKey] = keys(currPage.page);

  return (
    <div
      ref={ref}
      className={`${Styles.container} ${className}`}
      data-testid="infinity-parent"
      onScroll={
        !isCountTheSameOrLowerThanPage
          ? () => {
              const pageToIncrement = shouldIncrementPage(
                parentDiv.current!.scrollLeft,
                prevDiv.current!.offsetLeft,
                currDiv.current!.offsetLeft,
                nextDiv.current!.offsetLeft
              );

              if (pageToIncrement) {
                setCurrPage((prev) => {
                  let nextPage = prev.page + pageToIncrement;
                  if (nextPage < 0) {
                    nextPage = Math.ceil(items.length / pageSize) - 1;
                  }
                  let offset = prev.offset;
                  let nextIndex = nextPage * pageSize + offset;
                  if (nextIndex > items.length) {
                    offset = nextIndex - items.length;
                    nextPage = 0;
                  }

                  return {
                    page: nextPage,
                    offset,
                  };
                });
              }
            }
          : undefined
      }
    >
      {!isCountTheSameOrLowerThanPage && (
        <div
          key={beforeKey}
          className={pageClass}
          data-testid="infinity-prev"
          ref={prevDiv}
        >
          {getItems(currPage.page - 1, currPage.offset)}
        </div>
      )}
      <div
        key={currKey}
        className={pageClass}
        data-testid="infinity-curr"
        ref={currDiv}
      >
        {getItems(currPage.page, currPage.offset)}
      </div>
      {!isCountTheSameOrLowerThanPage && (
        <div
          key={afterKey}
          className={pageClass}
          data-testid="infinity-next"
          ref={nextDiv}
        >
          {getItems(currPage.page + 1, currPage.offset)}
        </div>
      )}
    </div>
  );
}

export default forwardRef(InfinityScroll);
