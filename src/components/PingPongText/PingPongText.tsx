import React, {
  ComponentProps,
  PropsWithChildren,
  useEffect,
  useRef,
} from "react";
import Text from "../Text/Text";
import Styles from "./PingPongText.module.scss";
import useMouseHover from "../../hooks/ui/useMouseHover";

const HOW_MUCH_PIXELS_TO_SCROLL_PER_SECOND = 50;
const RIGHT_TEXT_MULTIPLIER = 5;

/**
 * A component that keeps an overflow piece of text visible by continously scrolling it back and forward
 **/
export default function PingPongText({
  ...props
}: ComponentProps<typeof Text>) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const { uiEvents, hovering } = useMouseHover();

  useEffect(() => {
    if (!hovering) {
      let scrollingInterval: NodeJS.Timeout;
      let scrollStartTimeout: NodeJS.Timeout;
      scrollStartTimeout = setTimeout(() => {
        const textEl = textRef.current!;
        const overflowWidth = textEl.scrollWidth;
        const viewWidth = textEl.clientWidth;
        const secondsPerFrame = 1000 / 60;
        const howMuchToMove =
          (secondsPerFrame * HOW_MUCH_PIXELS_TO_SCROLL_PER_SECOND) / 1000;

        if (overflowWidth > viewWidth) {
          scrollingInterval = scrollText();
          function scrollText(direction: "l" | "r" = "r") {
            return setInterval(() => {
              const reachedEnd =
                direction === "r"
                  ? textEl.scrollLeft >= overflowWidth - viewWidth
                  : textEl.scrollLeft === 0;
              if (reachedEnd) {
                clearInterval(scrollingInterval);
                scrollStartTimeout = setTimeout(
                  () => {
                    scrollingInterval = scrollText(
                      direction === "r" ? "l" : "r"
                    );
                  },
                  direction === "r" ? 2000 : 1000
                );
              } else {
                if (direction === "r")
                  textEl.scrollTo(textEl.scrollLeft + howMuchToMove, 0);
                else {
                  textEl.scrollTo(
                    textEl.scrollLeft - howMuchToMove * RIGHT_TEXT_MULTIPLIER,
                    0
                  );
                }
              }
            }, secondsPerFrame);
          }
        }
      }, 1000);
      return () => {
        clearTimeout(scrollStartTimeout);
        clearInterval(scrollingInterval);
      };
    }
  }, [hovering]);

  return (
    <Text
      ref={textRef}
      {...uiEvents}
      {...props}
      className={`${Styles.pingPong} ${props.className || ""}`}
    />
  );
}
