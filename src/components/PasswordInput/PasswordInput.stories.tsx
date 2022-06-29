import React from "react";
import OneUIProvider from "../../context/OneUIProvider";
import PasswordInput from "./PasswordInput"

export default {
    title: 'Password Input',
    component: PasswordInput,
};

export const InitialImplementation = (args: any) => <OneUIProvider config={{component: {
    passwordInput: {iconSrc: {
        passwordHidden: "",
        passwordVisible: ""
    }}
}}}>
    <PasswordInput {...args} />
    
</OneUIProvider>;
