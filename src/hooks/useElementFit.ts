import { RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * This hook receives a base width of an element and returns how much items fit **vertically** inside the referenced html element
 *
 * @param baseWidth The base width of each element
 */
export default function useElementFit(
  baseWidth: number,
  baseHeight?: number
): {
  /** The amount of items that are able to fit in the available width */
  howManyItemsFit?: number;
  /** The amount of items that are able to fit in the available visible space + a row more so it can be scrollable */
  howManyItemsFitWithExtraRow?: number;
  /** How many items would fit a single row */
  howManyItemsByRow?: number;
  /** How many items until it overflows width */
  anItemMore?: number;

  /** The ref to be sent to the element that will receive the items */
  ref: RefObject<HTMLDivElement | null>;
} {
  const ref = useRef<HTMLDivElement>(null);
  function calculateDimension() {
    function howManyItemsStackVertically() {
      if (!ref.current || baseHeight === undefined) return 1;
      return Math.floor(ref.current!.clientHeight / baseHeight);
    }
    if ((window as any).PRERENDER)
      return {
        howManyItemsWillBeVisible: 4,
        byRow: 4,
      };

    const width = ref.current?.clientWidth || window.visualViewport!.width;
    const maxItemsHorizontally = Math.floor(width / baseWidth) || 1;

    if (process.env.NODE_ENV === "development")
      require("../models/DebugLogger").default(
        `${useElementFit.name}:clientWidth`,
        ref.current?.clientWidth
      );
    return {
      howManyItemsWillBeVisible:
        maxItemsHorizontally * howManyItemsStackVertically(),
      byRow: maxItemsHorizontally,
    };
  }
  const [itemsToShow, setItemsToShow] = useState<
    ReturnType<typeof calculateDimension> | undefined
  >(
    (window as any).PRERENDER
      ? {
          byRow: 4,
          howManyItemsWillBeVisible: 4,
        }
      : undefined
  );
  useEffect(() => {
    setItemsToShow(calculateDimension());
    function onResize() {
      setItemsToShow(calculateDimension());
    }
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return {
    howManyItemsFit: itemsToShow?.howManyItemsWillBeVisible,
    howManyItemsFitWithExtraRow: itemsToShow
      ? itemsToShow.howManyItemsWillBeVisible + itemsToShow.byRow
      : undefined,
    anItemMore: itemsToShow
      ? itemsToShow.howManyItemsWillBeVisible + 1
      : undefined,
    howManyItemsByRow: itemsToShow?.byRow,
    ref,
  };
}
