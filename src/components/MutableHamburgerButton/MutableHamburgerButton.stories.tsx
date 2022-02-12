import React from 'react';
import MutableHamburgerButton from "./MutableHamburgerButton";
    
export default {
    component: MutableHamburgerButton,
    title: "Mutable Hamburger Button"
}

export const InitialImplementation = (args: any) => <MutableHamburgerButton {...args}/>;
InitialImplementation.args = {} as Partial<React.ComponentProps<typeof MutableHamburgerButton>>