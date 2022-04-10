import React, { useEffect, useRef } from "react";

export default function HSForms({
  region,
  partialId,
  formId,
}: {
  region: "na1";
  partialId: string;
  formId: string;
}) {
  if ((window as any).PRERENDER) return null;
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
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
      });`;
      container.current!.appendChild(createFormScript);
    };
    document.head.appendChild(script);
  }, [region, partialId, formId]);
  return <div ref={container}></div>;
}
