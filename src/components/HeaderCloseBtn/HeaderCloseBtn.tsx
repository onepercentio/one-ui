import React from "react";
import Styles from "./HeaderCloseBtn.module.scss";

/**
 * A simple close button implemented with pure HTML and CSS
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
