import throttle from "lodash/throttle";
import React, { RefObject, useEffect, useMemo, useRef, useState } from "react";
import Styles from "./PaginationIndicator.module.scss";

/**
 * A cool component to indicate how many pages are
 **/
export function PaginationIndicatorView({
  size,
  page,
  pages,
}: {
  size: number;
  page: number;
  pages: number;
}) {
  const root = useRef<HTMLDivElement>(null);
  const pageIndex = page - 1;
  const numBalls = useMemo(() => {
    const numBalls = pages >= 7 ? 7 : Math.ceil(pages) + 1;

    return numBalls;
  }, []);

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
    const left = 1.4 * (maxBallsOffset - resetPageIndex) + "em";
    return new Array(numBalls).fill(undefined).map((_, i) => {
      const isLastBall = i === numBalls - 1;
      const isFirstBall = i === 0;
      return (
        <div
          key={String(i)}
          style={{
            left,
            transform:
              numBalls < 7 || pages === 6
                ? undefined
                : page <= maxBallsOffset + 1 && isLastBall
                ? `scale(0)`
                : page >= lastPages + 1 && isFirstBall
                ? `scale(0)`
                : isCenterPage
                ? isFirstBall
                  ? `scale(${1 - modulus})`
                  : isLastBall
                  ? `scale(${modulus})`
                  : undefined
                : undefined,
          }}
        />
      );
    });
  }, [maxBallsOffset, pageIndex, pages]);

  return (
    <div
      className={`${Styles.root}`}
      ref={root}
      style={{ fontSize: `${size}px` }}
    >
      {balls}
    </div>
  );
}

export default function PaginationIndicator({
  scrollableRef,
  estimatedWidth,
  size,
}: {
  scrollableRef: RefObject<HTMLDivElement>;
  estimatedWidth?: number;
  size: number;
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const [defs, setDefs] =
    useState<{
      pages: number;
    }>();

  useEffect(() => {
    const maxWidth = estimatedWidth || scrollableRef.current!.scrollWidth;
    setDefs({
      pages: Math.ceil(maxWidth / scrollableRef.current!.clientWidth) - 1,
    });
  }, []);

  useEffect(() => {
    if (!defs) return;
    const el = scrollableRef.current!;
    const calculateScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const page =
        1 + e.currentTarget.scrollLeft / scrollableRef.current!.clientWidth;
      setCurrentPage(page);
    };
    el.addEventListener("scroll", calculateScroll as any);
    return () => {
      el.removeEventListener("scroll", calculateScroll as any);
    };
  }, [defs]);

  return !defs ? null : (
    <PaginationIndicatorView
      pages={defs.pages}
      page={currentPage}
      size={size}
    />
  );
}
