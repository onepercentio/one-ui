import React, { useState } from "react";
import OneUIProvider from "../../context/OneUIProvider";
import FileInput from "./FileInput";

export default {
  component: FileInput,
  title: "File Input",
};

export const InitialImplementation = (args: any) => {
  const [uploadedFile, setUploadedFile] = useState<File>();

  return (
    <OneUIProvider
      config={{
        component: {
          fileInput: {
            Icon: ExampleIcon,
          },
        },
      }}
    >
      <FileInput
        {...args}
        file={uploadedFile}
        onFile={setUploadedFile}
        fileProvided={uploadedFile?.name || ""}
      />
    </OneUIProvider>
  );
};
InitialImplementation.args = {
  reason: "Upload a file for X",
  uploadAction: "Upload",
  removeAction: "Remove file",
  footer: "Selecione o arquivo no formato JPG ou PNG em até 5MB.",
} as Partial<React.ComponentProps<typeof FileInput>>;

function ExampleIcon() {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 22 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.6666 0.666687H2.99992C1.53325 0.666687 0.346586 1.86669 0.346586 3.33335L0.333252 24.6667C0.333252 26.1334 1.51992 27.3334 2.98658 27.3334H18.9999C20.4666 27.3334 21.6666 26.1334 21.6666 24.6667V8.66669L13.6666 0.666687ZM18.9999 24.6667H2.99992V3.33335H12.3333V10H18.9999V24.6667ZM5.66658 18.0134L7.54658 19.8934L9.66658 17.7867V23.3334H12.3333V17.7867L14.4533 19.9067L16.3333 18.0134L11.0133 12.6667L5.66658 18.0134Z"
        fill="#626E80"
      />
    </svg>
  );
}
