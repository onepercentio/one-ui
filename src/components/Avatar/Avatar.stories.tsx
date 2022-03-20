import React from 'react';
import Avatar from "./Avatar";
    
export default {
    component: Avatar,
    title: "Avatar"
}

export const InitialImplementation = (args: any) => <Avatar {...args}/>;
InitialImplementation.args = {
    name: "Put your name here",
    size: 48
} as Partial<React.ComponentProps<typeof Avatar>>