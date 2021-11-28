import React from 'react';
import FadeIn from "./FadeIn";
    
export default {
    component: FadeIn,
    title: "Fade In"
}

export const InitialImplementation = (args: any) => <FadeIn {...args}/>;
InitialImplementation.args = {} as Partial<React.ComponentProps<typeof FadeIn>>