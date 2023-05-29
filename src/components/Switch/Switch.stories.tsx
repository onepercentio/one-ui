import React from 'react';
import Switch from "./Switch";
    
export default {
    component: Switch,
    title: "Switch"
}

export const InitialImplementation = (args: any) => <Switch {...args}/>;
InitialImplementation.args = {} as Partial<React.ComponentProps<typeof Switch>>