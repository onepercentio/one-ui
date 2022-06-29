import React from "react";
import SectionContainer from "./SectionContainer"

export default {
    title: 'Section Container',
    component: SectionContainer,
};

export const InitialImplementation = (args: any) => (
    <SectionContainer {...args} />
);
