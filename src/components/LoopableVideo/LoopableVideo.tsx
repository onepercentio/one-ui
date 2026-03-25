import React, {
  DetailedHTMLProps,
  HTMLAttributes,
  useLayoutEffect,
  useRef,
} from "react";

/**
 * Plays a video and loops between the end and the timestamp you set
 */
/**
 * This component displays a video that automatically restarts from a specific point when it reaches the end, creating a seamless loop effect.
 */
export default function LoopableVideo({
  videoSrc,
  percentToBackTo,
  ...props
}: {
  videoSrc: string;
  /** A value between 0-1 indicating the timestamp to go back to */
  percentToBackTo: number;
} & DetailedHTMLProps<HTMLAttributes<HTMLVideoElement>, HTMLVideoElement>) {
  if (process.env.NODE_ENV === "development")
    if (percentToBackTo < 0 || percentToBackTo > 1)
      throw new Error(`percentToBackTo should be a value between 0-1`);
  return (
    <video
      autoPlay
      muted
      onEnded={({ currentTarget }) => {
        const el = currentTarget as Omit<HTMLVideoElement, keyof HTMLElement>;
        el.currentTime = el.duration * percentToBackTo;
        el.play();
      }}
      {...props}
    >
      <source src={videoSrc} />
    </video>
  );
}