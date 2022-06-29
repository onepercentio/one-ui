import React, { ComponentProps, ComponentPropsWithRef } from "react";
import Form, { FirebaseFormProps } from "./Form";

export default {
  title: "Form",
  component: Form,
};

export const InitialImplementation = (args: any) => <Form {...args} />;

InitialImplementation.args = {
  config: {
    email: {
      type: "email",
      messages: {
        invalidEmail: "Email invalido",
      },
      validator: (e) => (!!e ? true : "Fail"),
      placeholder: "Something",
    },
  },
  onSubmit: () => {},
  submitting: true,
  submited: false,
  submitBtn: {
    error: [() => <>Error</>],
    label: [() => <>Enviar</>],
    loading: [() => <>Enviando</>],
    success: [() => <>Enviado</>],
  },
} as FirebaseFormProps<{
  email: string;
}>;
