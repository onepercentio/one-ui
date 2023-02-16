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

const MAX_BALLS = 7;
const eachBallWidthEm = 1.2;

const CENTER_GUIDE_BALL = 1;

export enum PaginationIndicatorMode {
  /** This will make the guide ball be kept on center  */
  CENTERED,

  /** This will make the guide ball move, while the indicator balls keep in place */
  START,
}

/**
 * A cool component to indicate how many pages are
 **/
export function PaginationIndicatorView({
  size,
  page: currentPage,
  pages: decimalPages,
  className,
  onClickPage,
  mode = PaginationIndicatorMode.CENTERED,
}: {
  size: number;
  page: number;
  pages: number;
  className: string;
  onClickPage?: (page: number) => void;
  mode?: PaginationIndicatorMode;
}) {
  const page = useMemo(() => {
    const floor = Math.floor(decimalPages);
    const modulus = decimalPages % floor;

    if (currentPage > floor) {
      const currentFloorModulus = currentPage % floor;
      const equivalent = (currentFloorModulus * 100) / modulus;

      return floor + equivalent / 100;
    } else {
      return currentPage;
    }
  }, [currentPage, decimalPages]);
  const rand = useMemo(() => Math.random().toString(), []);
  const pageIndex = page - 1;
  const pages = useMemo(() => Math.ceil(decimalPages), [decimalPages]);
  const numBalls = useMemo(() => {
    const numBalls = pages >= MAX_BALLS ? MAX_BALLS : Math.ceil(pages);

    return numBalls;
  }, [pages]);

  const indexForTheBallsCenter = useMemo(() => (numBalls - 1) / 2, [numBalls]);
  const balls = useMemo(() => {
    const indexForLastPages = pages + 1 - indexForTheBallsCenter;
    /**
     * Is the page index (position of the center)
     * after the first pages and
     * before the last pages */
    const isCenterPage =
      numBalls >= MAX_BALLS &&
      pageIndex > indexForTheBallsCenter &&
      pageIndex < indexForLastPages - 1;
    let modulus =
      pageIndex %
      (1 + (indexForTheBallsCenter - Math.floor(indexForTheBallsCenter)));
    const resetPageIndex = isCenterPage
      ? indexForTheBallsCenter + modulus
      : pages < MAX_BALLS
      ? pageIndex
      : pageIndex >= indexForLastPages - 1
      ? numBalls - (pages - pageIndex)
      : pageIndex;
    const left = eachBallWidthEm * resetPageIndex;
    const { pushBallsToRightBy, pushBallsToLeftBy, pushGuideToRightBy } =
      mode === PaginationIndicatorMode.CENTERED
        ? {
            pushBallsToRightBy: Math.min(pages, MAX_BALLS) * eachBallWidthEm,
            pushBallsToLeftBy: left,
            pushGuideToRightBy: 0,
          }
        : {
            pushBallsToRightBy: (eachBallWidthEm - 0.5) / 2,
            pushBallsToLeftBy: 0,
            pushGuideToRightBy: left,
          };
    let pushToLeft: number = 0;
    return new Array(CENTER_GUIDE_BALL + numBalls)
      .fill(undefined)
      .map((_, i) => {
        const isLastBall = i === numBalls - 1;
        const isFirstBall = i === 0;

        if (i === numBalls) {
          const diameter = 0.45 * 2;
          const padding = (eachBallWidthEm - diameter) / 2;
          return (
            <rect
              fill="#fff"
              width={`${diameter}em`}
              height={`${diameter}em`}
              x={`${
                pushBallsToRightBy - padding + pushGuideToRightBy - pushToLeft
              }em`}
              y={`${padding}em`}
              rx={`${diameter / 2}em`}
            />
          );
        }

        const ballSize =
          numBalls < MAX_BALLS
            ? 0.5
            : page <= indexForTheBallsCenter + 1 && isLastBall
            ? 0
            : pageIndex >= indexForLastPages - 1 && isFirstBall
            ? 0
            : isCenterPage
            ? isFirstBall
              ? 0.5 - modulus * 0.5
              : isLastBall
              ? modulus * 0.5
              : 0.5
            : 0.5;

        if (i === 0 && mode === PaginationIndicatorMode.START)
          pushToLeft = (0.5 - ballSize) * 2.4;

        return (
          <rect
            width={`${ballSize * 1.2}em`}
            height={`${ballSize * 1.2}em`}
            x={`${
              pushBallsToRightBy +
              i * eachBallWidthEm -
              pushBallsToLeftBy -
              pushToLeft
            }em`}
            y={`${(eachBallWidthEm - ballSize * 1.2) / 2}em`}
            rx={`${(ballSize * 1.2) / 2}em`}
            onClick={() => {
              if (onClickPage) {
                const pageClicked =
                  (!isCenterPage
                    ? pageIndex >= indexForLastPages - 1
                      ? Math.floor(page) - resetPageIndex - 1
                      : 0
                    : Math.floor(page) - (indexForTheBallsCenter + 1)) +
                  1 +
                  i;
                onClickPage(pageClicked);
              }
            }}
          />
        );
      });
  }, [indexForTheBallsCenter, pageIndex, pages]);
  const [guideBall, ...pageBalls] = balls.reverse();

  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        width: `${eachBallWidthEm * Math.min(pages, MAX_BALLS) * 2}em`,
        minWidth: `${eachBallWidthEm * Math.min(pages, MAX_BALLS) * 2}em`,
        height: "1.2em",
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
        <g filter={`url(#${`goo-${rand}`})`} fill="#fff">
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
      {onClickPage && (
        <g opacity={0} style={{ cursor: "pointer" }}>
          {pageBalls}
        </g>
      )}
    </svg>
  );
}

function _PaginationIndicator(
  {
    scrollableRef,
    estimatedWidth,
    size,
    className = "",
    onClickPage,
  }: {
    scrollableRef: RefObject<HTMLDivElement>;
    estimatedWidth?: number;
    size: number;
    className?: string;
    onClickPage?: (page: number) => void;
  },
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
    if (!scrollableRef.current) return;
    const maxWidth =
      estimatedWidth === undefined
        ? scrollableRef.current!.scrollWidth
        : estimatedWidth;

    const pages = maxWidth / scrollableRef.current!.clientWidth;
    if (pages > 1)
      setDefs({
        pages,
      });
  }, [estimatedWidth]);

  useEffect(() => refreshPages(), [refreshPages]);

  const updatePageIndicators = useCallback(
    (target: HTMLDivElement, pages: number) => {
      if (!scrollableRef.current) return;
      const eachPageWidth = scrollableRef.current!.clientWidth;
      const page = 1 + target.scrollLeft / eachPageWidth;
      const lastPageProgress = Math.floor(pages) + 1;
      const maximumProgress = pages + 1;

      const diffToMax = maximumProgress - lastPageProgress;
      const currentProgressOnDiff = page - lastPageProgress;

      if (page > lastPageProgress)
        setCurrentPage(lastPageProgress + currentProgressOnDiff / diffToMax);
      else setCurrentPage(page);
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

  const pages = useMemo(() => (defs ? defs.pages : undefined), [defs]);

  return !pages ? null : (
    <PaginationIndicatorView
      pages={pages}
      page={currentPage}
      size={size}
      className={className}
      onClickPage={onClickPage}
    />
  );
}

export default forwardRef(_PaginationIndicator);
