import React, { useEffect, useMemo, useRef } from "react";
import Styles from "./CodeInput.module.scss";
import { Uri } from "monaco-editor";
import Loader from "../Loader";
import useModule from "../../hooks/utility/useModule";

window.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    if (label === "typescript" || label === "javascript")
      return "./ts.worker.js";
    return "./editor.worker.js";
  },
};

/**
 * Allows the user to input code using monaco editor
 **/
export default function CodeInput({
  codeSample,
  onChange,
  mode,
}: {
  codeSample?: string;
  onChange?: (code: string) => void;
  mode?: "dark" | "light";
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const Monaco = useModule(() => import("monaco-editor"));
  const content = useMemo(() => {
    if (!Monaco) return <Loader />;
    else {
      return null;
    }
  }, [Monaco]);
  const editorRef =
    useRef<import("monaco-editor").editor.IStandaloneCodeEditor>();
  useEffect(() => {
    if (Monaco) {
      Monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
      });
      const editor = Monaco.editor.create(divRef.current!, {
        language: "typescript",
        scrollBeyondLastLine: false,
        minimap: { enabled: false },
        folding: false,
        readOnly: !onChange,
        theme: mode === "dark" ? "vs-dark" : undefined,
        automaticLayout: true
      });
      editor.onDidContentSizeChange(() => {
        if (!editorRef.current) {
          editorRef.current = editor;
        }
      });
      editor.onDidChangeModelContent(() => {
        if (onChange) onChange(editor.getModel()!.getValue());
      });
      const model = Monaco.editor.createModel(
        codeSample || "",
        "typescript",
        Uri.file(`example.tsx`)
      );
      editor.setModel(model);
      return () => {
        model.dispose();
      };
    }
  }, [Monaco]);
  useEffect(() => {
    if (!codeSample) return;
    const editor = editorRef.current;
    if (!editor) return;
    const model = editor.getModel();
    if (!model) return;
    const currentValue = model.getValue();
    if (codeSample !== currentValue) model.setValue(codeSample);
  }, [codeSample]);
  return (
    <div ref={divRef} className={Styles.root}>
      {content}
    </div>
  );
}
