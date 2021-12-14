import React, { ComponentProps, useEffect, useState } from "react";
import C from "./ProgressTexts";

export default {
  component: C,
  title: "Drawer de etapas",
};

export function ExemploCompleto() {
  const [currStep, setCurrStep] = useState(0);
  const etapas: ComponentProps<typeof C>["steps"] = [
    {
      title: "Essa é a primeira etapa (type: wait)",
      type: "wait",
    },
    {
      title: "Essa é a segunda etapa (type: wait) com descricao",
      description: "Descricao de exemplo",
      type: "wait",
    },
    {
      title: "Essa é uma terceira etapa (type: wait) com uma ação",
      description: "Descricao de exemplo",
      action: {
        label: "Clique em mim",
        onClick: () => alert("Quem mandou??? xD"),
      },
      type: "wait",
    },
    {
      title: "Essa é uma ultima etapa (type: final)",
      description: "que vai sobrepor todas as outras",
      action: {
        label: "Clique em mim",
        onClick: () => alert("Denovo??? xD"),
      },
      type: "final",
    },
  ];

  useEffect(() => {
    setInterval(() => {
      setCurrStep((p) => (p < 3 ? p + 1 : 0));
    }, 3000);
  }, []);
  return <C steps={etapas} currentStep={currStep} />;
}

export const Primary = (args: any) => <C {...args} />;
Primary.args = {
  currentStep: 0,
  steps: [
    {
      title: "Titulo 1",
      type: "final",
    },
    {
      title: "Titulo 2",
      type: "final",
    },
  ],
} as Partial<ComponentProps<typeof C>>;
