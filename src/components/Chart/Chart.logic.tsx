import React from 'react';
import View from "./Chart.view";
import { ChartProps } from "./Chart.types";

export default function ChartLogic(props: ChartProps) {
    return <View {...props} />;
}