import React, {
  ForwardedRef,
  forwardRef,
  RefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

type CustomizationProps = {
  /**
   * This will define how the pagination indicator calculates start and end
   *
   *      "page" - Calculates scrolling over client width as each page
   *      "scroll" - Calculates scrolling progress over maximum scrollable width
   */
  mode?: "page" | "scroll";
};

const eachBallWidthEm = 1.2;
const pushToborder = 7 * eachBallWidthEm;
/**
 * A cool component to indicate how many pages are
 **/
export function PaginationIndicatorView({
  size,
  page,
  pages,
  className,
}: {
  size: number;
  page: number;
  pages: number;
  className: string;
}) {
  const rand = useMemo(() => Math.random().toString(), []);
  const pageIndex = page - 1;
  const numBalls = useMemo(() => {
    const numBalls = pages >= 7 ? 7 : Math.ceil(pages) + 1;

    return numBalls;
  }, [pages]);

  const maxBallsOffset = useMemo(() => (numBalls - 1) / 2, [numBalls]);
  const prevVal = useRef(0);
  const balls = useMemo(() => {
    const lastPages = pages + 1 - maxBallsOffset;
    const isCenterPage =
      numBalls >= 7 && pageIndex > maxBallsOffset && pageIndex < lastPages;
    let modulus =
      pageIndex % (1 + (maxBallsOffset - Math.floor(maxBallsOffset)));
    const resetPageIndex = isCenterPage
      ? maxBallsOffset + modulus
      : pageIndex > lastPages - 1
      ? numBalls - 1 - (pages - pageIndex)
      : pageIndex;
    prevVal.current = modulus;
    const left = 1.2 * resetPageIndex;
    return new Array(
      numBalls + 1 + (isCenterPage && pages >= 7 && page < lastPages ? 1 : 0)
    )
      .fill(undefined)
      .map((_, i) => {
        const isLastBall = i === numBalls + 1;
        const isFirstBall = i === 1;

        if (i === 0)
          return (
            <circle
              fill="#fff"
              r={`${0.45}em`}
              cx={`${pushToborder}em`}
              cy={"0.5em"}
            />
          );
        const ballSize =
          numBalls < 7 || pages === 6
            ? 0.5
            : page <= maxBallsOffset + 1 && isLastBall
            ? 0
            : page >= lastPages + 1 && isFirstBall
            ? 0
            : isCenterPage
            ? isFirstBall
              ? 0.5 - modulus * 0.5
              : isLastBall
              ? modulus * 0.5
              : 0.5
            : 0.5;
        return (
          <circle
            fill="#fff"
            r={`${ballSize * 0.6}em`}
            cx={`${pushToborder + (i - 1) * eachBallWidthEm - left}em`}
            cy={"0.5em"}
          />
        );
      });
  }, [maxBallsOffset, pageIndex, pages]);
  const [guideBall, ...pageBalls] = balls;
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        width: `${eachBallWidthEm * 7 * 2}em`,
        minWidth: `${eachBallWidthEm * 7 * 2}em`,
        height: "1em",
        fontSize: `${size}px`,
      }}
    >
      <filter id={`goo-${rand}`}>
        <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="5" />
        <feColorMatrix
          in="blur"
          mode="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
          result="goo"
        />
        <feBlend in2="goo" in="SourceGraphic" result="mix" />
      </filter>
      <mask id={`mask-${rand}`}>
        <g filter={`url(#${`goo-${rand}`})`}>
          {[pageBalls]}
          {guideBall}
        </g>
      </mask>
      <rect
        x="0"
        y="0"
        mask={`url(#${`mask-${rand}`})`}
        width="100%"
        height="100%"
        style={{ fill: "var(--digital-blue)" }}
      ></rect>
    </svg>
  );
}

function _PaginationIndicator(
  {
    scrollableRef,
    estimatedWidth,
    size,
    mode = "scroll",
    className = "",
  }: {
    scrollableRef: RefObject<HTMLDivElement>;
    estimatedWidth?: number;
    size: number;
    className?: string;
  } & CustomizationProps,
  ref: ForwardedRef<{
    refreshPages: () => void;
  }>
) {
  const [currentPage, setCurrentPage] = useState(1);

  const [defs, setDefs] =
    useState<{
      pages: number;
    }>();

  const refreshPages = useCallback(() => {
    const maxWidth = estimatedWidth || scrollableRef.current!.scrollWidth;
    setDefs({
      pages: Math.ceil(maxWidth / scrollableRef.current!.clientWidth) - 1,
    });
  }, [estimatedWidth]);

  useEffect(() => {
    const maxWidth = estimatedWidth || scrollableRef.current!.scrollWidth;
    setDefs({
      pages: Math.ceil(maxWidth / scrollableRef.current!.clientWidth) - 1,
    });
  }, [estimatedWidth]);

  const updatePageIndicators = useCallback(
    (target: HTMLDivElement, pages: number) => {
      if (mode === "page") {
        const eachPageWidth = scrollableRef.current!.clientWidth;
        const page = 1 + target.scrollLeft / eachPageWidth;
        setCurrentPage(page);
      } else {
        const maxWidth = estimatedWidth || scrollableRef.current!.scrollWidth;
        const availableTOScroll = maxWidth - scrollableRef.current!.clientWidth;
        const page =
          1 + ((target.scrollLeft * 100) / availableTOScroll / 100) * pages;
        setCurrentPage(page);
      }
    },
    []
  );

  useImperativeHandle(
    ref,
    () => ({
      refreshPages,
    }),
    []
  );

  useEffect(() => {
    if (!defs) return;
    const el = scrollableRef.current!;
    const onScroll = (e: Event) =>
      updatePageIndicators(e.currentTarget as HTMLDivElement, defs.pages);
    updatePageIndicators(el, defs.pages);
    el.addEventListener("scroll", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
    };
  }, [defs]);

  return !defs ? null : (
    <PaginationIndicatorView
      pages={defs.pages}
      page={currentPage}
      size={size}
      className={className}
    />
  );
}

export default forwardRef(_PaginationIndicator);
