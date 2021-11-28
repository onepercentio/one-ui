import React from 'react';
import Loader from "./Loader";
    
export default {
    component: Loader,
    title: "Loader"
}

export const InitialImplementation = (args: any) => <Loader {...args}/>;
InitialImplementation.args = {} as Partial<React.ComponentProps<typeof Loader>>