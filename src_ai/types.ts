export type AIDocumentationStep = {
  description: string;
  introduceCode: string;
};

export type AIDocumentationTemplate = {
  [templateId: string]: {
    steps: AIDocumentationStep[];
  };
};
