import React from "react";
import LoopableVideo from "./LoopableVideo";
import SampleVideo from "../../storybook/assets/video/txt-reversed.mp4";

export default {
  component: LoopableVideo,
  title: "Loopable Video",
};

export const InitialImplementation = (args: any) => {
  return (
    <>
      <h1>Video src {args.videoSrc}</h1>
      <LoopableVideo {...args} />
    </>
  );
};
InitialImplementation.args = {
  videoSrc: SampleVideo,
  percentToBackTo: 0.75,
} as Partial<React.ComponentProps<typeof LoopableVideo>>;
