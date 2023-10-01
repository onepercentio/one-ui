import Button from "components/Button";
import Form from "components/Form/v2/Form";
import { AnswersMap, FormState } from "components/Form/v2/Form.types";
import OneUIProvider from "context/OneUIProvider";
import { useEffect, useState } from "react";

it("Should be able to mount", () => {
  function Wrapper() {
    const [[answers, isValid], setFormState] = useState<FormState>([{}, false]);
    const [allErrors, setShowAllErrors] = useState(false);
    useEffect(() => {
      setShowAllErrors(false);
    }, [answers]);
    console.log(answers)
    return (
      <>
        <Form
          showAllErrors={allErrors}
          questions={[
            {
              type: "text",
              id: "Optional",
              title: "An optional field",
              optional: true,
            },
            {
              type: "text",
              id: "Validated",
              title: "A field with a validation",
              validator: (txt) =>
                txt?.includes("Murilo")
                  ? true
                  : txt === undefined
                  ? "This should not show"
                  : "Should include 'Murilo'",
            },
          ]}
          onFormUpdate={(...args) => setFormState(args)}
        />

        <Button
          onClick={() => {
            if (isValid) alert("Continuing");
            else setShowAllErrors(true);
          }}
        >
          {isValid ? "Can continue" : "Show all errors"}
        </Button>
      </>
    );
  }

  const chain = cy.mountChain(() => {
    return (
      <OneUIProvider
        config={{
          component: {
            form: {
              titleVariant: "boldTitleBig",
              labelVariant: "highlight",
              optionalLabel: "This is optional",
              requiredLabel: "This is required",
            },
          },
        }}
      >
        <Wrapper />
      </OneUIProvider>
    );
  });
  chain.remount();
});
