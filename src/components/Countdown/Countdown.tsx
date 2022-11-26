import React, { Fragment, useEffect, useMemo, useState } from "react";

export type TimeObject = {
  hours: number;
  minutes: number;
  seconds: number;
};

export function calculateTimeFromTimespan(timespan: number): TimeObject {
  const seconds = Math.floor(timespan / 1000);
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
}: {
  timeRemaining: number;
  onFinish?: () => void;
  model?: CountdownTextModel;
}) {
  const [t, setT] = useState<TimeObject>(() =>
    calculateTimeFromTimespan(timeRemaining)
  );

  useEffect(() => {
    const cl = setInterval(() => {
      setT((prev) => {
        let nextSecond = prev!.seconds - 1;
        let nextMinute = prev!.minutes;
        let nextHour = prev!.hours;
        if (nextSecond < 0) {
          nextSecond = 59;
          nextMinute -= 1;
          if (nextMinute < 0) {
            nextMinute = 59;
            nextHour -= 1;
          }
        }

        if (nextHour === 0 && nextMinute === 0 && nextSecond === 0) {
          if (onFinish) onFinish();
          clearInterval(cl);
        }

        return {
          seconds: nextSecond,
          minutes: nextMinute,
          hours: nextHour,
        };
      });
    }, 1000);

    return () => {
      clearInterval(cl);
    };
  }, [timeRemaining]);

  const txt = useMemo(() => {
    switch (model) {
      case CountdownTextModel.CLOCK:
        return (
          <Fragment>
            {`${IntegerFormatter.format(t!.hours)}:${IntegerFormatter.format(
              t!.minutes
            )}:${IntegerFormatter.format(t!.seconds)}`}
          </Fragment>
        );
      case CountdownTextModel.SHORT:
        return (
          <Fragment>
            {IntegerFormatter.format(t!.hours)}
            <span>h</span>&nbsp;
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
