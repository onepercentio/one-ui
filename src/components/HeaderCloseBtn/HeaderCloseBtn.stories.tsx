import React from 'react';
import HeaderCloseBtn from "./HeaderCloseBtn";
    
export default {
    component: HeaderCloseBtn,
    title: "Header Close Btn"
}

export const InitialImplementation = (args: any) => <HeaderCloseBtn {...args}/>;
InitialImplementation.args = {} as Partial<React.ComponentProps<typeof HeaderCloseBtn>>