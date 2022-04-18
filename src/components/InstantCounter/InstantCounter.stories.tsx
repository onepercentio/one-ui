import React from 'react';
import InstantCounter from "./InstantCounter";
    
export default {
    component: InstantCounter,
    title: "Instant Counter"
}

export const InitialImplementation = (args: any) => <InstantCounter {...args}/>;
InitialImplementation.args = {} as Partial<React.ComponentProps<typeof InstantCounter>>