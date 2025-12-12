import React, {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

export type TimeObject = {
  hours: number;
  minutes: number;
  seconds: number;
};

export function calculateTimeFromTimespan(timespan: number): TimeObject {
  const secondsFraction = timespan / 1000
  const seconds = Math.round(secondsFraction);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  return {
    hours,
    minutes: minutes % 60,
    seconds: seconds % 60,
  };
}

const IntegerFormatter = new Intl.NumberFormat(undefined, {
  minimumIntegerDigits: 2,
});

export enum CountdownTextModel {
  /** This shows the countdown on the format 00:00:00 */
  CLOCK,
  /** This shows the countdown on the format 00h 00m 00s */
  SHORT,
}

/**
 * You five it some time, and a countdown is shown
 **/
export default function Countdown({
  timeRemaining,
  onFinish,
  model = CountdownTextModel.CLOCK,
  options,
}: {
  timeRemaining: number;
  onFinish?: () => void;
  model?: CountdownTextModel;
  options?: {
    /** Controls if the hours fragment should be shown */
    hours: boolean;
  };
}) {
  const [t, setT] = useState<TimeObject>(() =>
    calculateTimeFromTimespan(timeRemaining)
  );

  const onFinishRef = React.useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useLayoutEffect(() => {
    setT(calculateTimeFromTimespan(timeRemaining));
  }, [timeRemaining]);

  useEffect(() => {
    const targetDate = Date.now() + timeRemaining;

    const tick = () => {
      const timeLeft = targetDate - Date.now();
      if (timeLeft <= 800) {
        setT(calculateTimeFromTimespan(0));
        if (onFinishRef.current) onFinishRef.current();
        clearInterval(cl);
      } else {
        setT(calculateTimeFromTimespan(timeLeft));
      }
    };

    const cl = setInterval(tick, 1000);

    return () => {
      clearInterval(cl);
    };
  }, [timeRemaining]);

  const txt = useMemo(() => {
    switch (model) {
      case CountdownTextModel.CLOCK:
        const hourFragment =
          options?.hours ?? true ? `${IntegerFormatter.format(t!.hours)}:` : "";
        return (
          <Fragment>
            {`${hourFragment}${IntegerFormatter.format(
              t!.minutes
            )}:${IntegerFormatter.format(t!.seconds)}`}
          </Fragment>
        );
      case CountdownTextModel.SHORT:
        const hourFragmentS =
          options?.hours ?? true ? (
            <>
              {IntegerFormatter.format(t!.hours)}
              <span>h</span>&nbsp;
            </>
          ) : (
            ""
          );
        return (
          <Fragment>
            {hourFragmentS}
            {IntegerFormatter.format(t!.minutes)}
            <span>m</span>&nbsp;
            {IntegerFormatter.format(t!.seconds)}
            <span>s</span>
          </Fragment>
        );
    }
  }, [t, model]);

  return <span>{txt}</span>;
}
