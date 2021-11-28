import React from 'react';
import AsyncWrapper from "./AsyncWrapper";
    
export default {
    component: AsyncWrapper,
    title: "Async Wrapper"
}

export const InitialImplementation = (args: any) => <AsyncWrapper {...args}/>;
InitialImplementation.args = {} as Partial<React.ComponentProps<typeof AsyncWrapper>>