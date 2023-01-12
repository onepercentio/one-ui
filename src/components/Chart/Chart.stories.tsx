import React from 'react';
import Chart from "./Chart.logic";
    
export default {
    component: Chart,
    title: "Chart"
}

export const InitialImplementation = (args: any) => <Chart {...args}/>;
InitialImplementation.args = {} as Partial<React.ComponentProps<typeof Chart>>