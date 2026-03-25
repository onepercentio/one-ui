import React from "react";
import Styles from "./HeaderCloseBtn.module.scss";

/**
 * A simple close button that can be used for back or close actions.
 * This component handles the visual styling and click behavior for navigation controls.
 **/
export default function HeaderButton({
  mode,
  hidden,
  onClick,
}: {
  mode: "back" | "close";
  hidden: boolean;
  onClick: () => void;
}) {
  return (
    <div
      data-testid="header-control-back"
      className={`${Styles.headerButton} ${Styles[mode]} ${
        hidden ? Styles.pointOfNoReturn : ""
      }`}
      onClick={onClick}
    >
      <div />
      <div />
    </div>
  );
}