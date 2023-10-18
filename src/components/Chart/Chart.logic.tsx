import React from 'react';
import View from "./Chart.view";
import { ChartProps } from "./Chart.types";

/** An proprietary implementation of some chart variations */
export default function ChartLogic(props: ChartProps) {
    return <View {...props} />;
}