import { ImageScales } from "@muritavo/webpack-microfrontend-scripts/bin/types/ImageScales";
import throttle from "lodash/throttle";
import { useEffect, useState } from "react";

/**
 * This hooks is built over the implementation of this loader https://github.com/Muritavo/webpack-microfrontend-scripts#imageresolutionoptimizer
 *
 */
export default function useAdaptiveImage(): ImageScales {
  function ScaleFromCurrentWidth() {
    if ((window as any).PRERENDER) return ImageScales.LARGE;
    const width = window.visualViewport!.width;
    if (width < 480) return ImageScales.SMALL;
    if (width < 800) return ImageScales.NORMAL;
    if (width < 1280) return ImageScales.BIG;
    if (width < 1920) return ImageScales.LARGE;
    else return ImageScales.EXTRA_LARGE;
  }

  const [currentScale, setCurrentScale] = useState<ImageScales>(() =>
    ScaleFromCurrentWidth()
  );

  useEffect(() => {
    const onResizeThrottle = throttle(() => {
      setCurrentScale(ScaleFromCurrentWidth());
    }, 1000 / 4);
    const onResize = () => onResizeThrottle();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return currentScale;
}
