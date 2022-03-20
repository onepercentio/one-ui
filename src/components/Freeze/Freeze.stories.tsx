import React, { useState } from "react";
import AdaptiveDialog from "../AdaptiveDialog";
import Freeze from "./Freeze";

export default {
  title: "Freeze",
  component: Freeze,
};

export const BasicUsage = () => {
  const [openModal, setOpen] = useState(false);
  const [openModalWithFreeze, setOpenWFreeze] = useState(false);
  return (
    <>
      <h1>
        The modal will have a content only when it's open, when closing, the
        content will be empty
      </h1>
      <button onClick={() => setOpen(true)}>Open without freeze</button>
      <AdaptiveDialog open={openModal} onClose={() => setOpen(false)}>
        {openModal && (
          <div>
            <h1>
              This is the content that shows up when the modal is opened. try
              closing it.
            </h1>
            <h2>Notice how the content goes away</h2>
          </div>
        )}
      </AdaptiveDialog>
      <br />
      <br />
      <button onClick={() => setOpenWFreeze(true)}>Open with freeze</button>

      <AdaptiveDialog
        open={openModalWithFreeze}
        onClose={() => setOpenWFreeze(false)}
      >
        <Freeze>
          {openModalWithFreeze && (
            <div>
              <h1> Now this content is using freeze component.</h1>
              This is the content that shows up when the modal is opened. try
              closing it.
              <h2>
                Notice how it doesn't go away, even though the child turns
                false because of the condition (check story)
              </h2>
            </div>
          )}
        </Freeze>
      </AdaptiveDialog>
    </>
  );
};
