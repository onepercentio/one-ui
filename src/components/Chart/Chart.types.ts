import { ReactElement } from "react";

export type ChartProps = ChartViewProps;
export type ChartViewProps = {
  bounds: Readonly<
    [
      horizontal: Readonly<[min: number, max: number, incrementRate: number]>,
      vertical: Readonly<[min: number, max: number, incrementRate: number]>
    ]
  >;

  style?: (
    | Partial<{
        lineColor: string;
        pointColor: string;
        textColor: string;
      }>
    | undefined
  )[];

  data?: Readonly<Readonly<Readonly<[x: number, y: number]>[]>[]>;

  points?: Readonly<
    Readonly<
      Readonly<
        [x: number, y: number, label: ReactElement, onlyOnHover?: boolean]
      >[]
    >[]
  >;

  label: {
    x: (val: number) => ReactElement;
    y: (val: number) => ReactElement;
  };
};
