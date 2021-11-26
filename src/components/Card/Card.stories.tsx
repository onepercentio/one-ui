import React from 'react';
import Card from "./Card";
    
export default {
    component: Card,
    title: "Card"
}

export const InitialImplementation = (...args: any) => <Card {...args}/>;
InitialImplementation.args = {} as Partial<React.ComponentProps<typeof Card>>