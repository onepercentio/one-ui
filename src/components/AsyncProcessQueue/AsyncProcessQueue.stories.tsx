import React from 'react';
import AsyncProcessTransition from "./AsyncProcessQueue";
    
export default {
    component: AsyncProcessTransition,
    title: "Async Process Transition"
}

export const InitialImplementation = (args: any) => <AsyncProcessTransition {...args}/>;
InitialImplementation.args = {} as Partial<React.ComponentProps<typeof AsyncProcessTransition>>