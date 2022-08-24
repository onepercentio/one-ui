import React, { useEffect, useRef } from "react";

export default function HSForms({
  region,
  partialId,
  formId,
  className,
  onFormReady,
  onFormSubmitted,
}: {
  region: "na1";
  partialId: string;
  formId: string;
  className?: string;
  onFormReady?: (div: HTMLDivElement, form: any) => void;
  onFormSubmitted?: () => void;
}) {
  if ((window as any).PRERENDER) return null;
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    import("jquery"!).then((jqueryModule) => {
      const funcId = String(Math.round(Math.random() * 999999));
      const idx = `onLoad${funcId}`;
      const idx2 = `onSubmit${funcId}`;
      (window as any)[idx as any] = function (form: any) {
        if (onFormReady) onFormReady(container.current!, form);
      };
      (window as any)[idx2 as any] = function () {
        if (onFormSubmitted) onFormSubmitted();
      };
      (window as any).jQuery = jqueryModule.default;
      const script = document.createElement("script");
      script.setAttribute("src", "https://js.hsforms.net/forms/v2.js");
      script.setAttribute("type", "text/javascript");
      script.setAttribute("charset", "utf-8");
      script.onload = () => {
        const createFormScript = document.createElement("script");
        createFormScript.setAttribute("type", "text/javascript");
        createFormScript.innerHTML = `hbspt.forms.create({
          region: "${region}",
          portalId: "${partialId}",
          formId: "${formId}",
          submitButtonClass: '#',
          css: ' ',
          cssClass: '#',
          onFormReady: ${idx},
          onFormSubmitted: ${idx2},
          formInstanceId: ${funcId}
        });`;
        container.current!.appendChild(createFormScript);
      };
      document.head.appendChild(script);
    });
  }, [region, partialId, formId]);
  return <div ref={container} className={className}></div>;
}
