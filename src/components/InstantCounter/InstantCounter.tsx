import React, {
  ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { FormatNumberOptions, useIntl } from "react-intl";

/**
 * Increments the numbers from 0 to X
 **/
function _InstantCounter(
  {
    from = 0,
    to,
    framesPerSecond = 30,
    durationInSeconds,
    formatOptions = {},
    autoStart = true,
  }: {
    from?: number;
    to: number;
    framesPerSecond?: number; //Usefull for testing
    durationInSeconds: number;
    formatOptions?: FormatNumberOptions;
    autoStart?: boolean;
  },
  ref: ForwardedRef<{ start: () => void }>
) {
  const [started, setStarted] = useState(autoStart);
  const initialValue = useRef<number>(from);
  const spanRef = useRef<HTMLSpanElement>(null);
  const { formatNumber } = useIntl();

  useImperativeHandle(
    ref,
    () => ({
      start: () => setStarted(true),
    }),
    []
  );

  useEffect(() => {
    if (started) {
      const incrementBy =
        (to - initialValue.current) / (framesPerSecond * durationInSeconds);
      spanRef.current!.innerHTML = formatNumber(
        initialValue.current!,
        formatOptions
      );

      const intervalId = setInterval(() => {
        initialValue.current! += incrementBy;
        spanRef.current!.innerHTML = formatNumber(
          initialValue.current!,
          formatOptions
        );
        if (Math.round(initialValue.current) === Math.round(to)) {
          clearInterval(intervalId);
        }
      }, 1000 / framesPerSecond);
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [started, to]);
  return (
    <>
      <span ref={spanRef} />
    </>
  );
}

const InstantCounter = forwardRef(_InstantCounter);
export default InstantCounter;
