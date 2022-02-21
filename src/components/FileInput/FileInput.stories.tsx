import React, { useState } from "react";
import FileInput from "./FileInput";

export default {
  component: FileInput,
  title: "File Input",
};

export const InitialImplementation = (args: any) => {
  const [uploadedFile, setUploadedFile] = useState<File>();

  return (
    <FileInput
      {...args}
      file={uploadedFile}
      onFile={setUploadedFile}
      fileProvided={uploadedFile?.name || ""}
    />
  );
};
InitialImplementation.args = {
  reason: "Upload a file for X",
  uploadAction: "Upload",
  removeAction: "Remove file",
} as Partial<React.ComponentProps<typeof FileInput>>;
