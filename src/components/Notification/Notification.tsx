import React, { PropsWithChildren } from "react";
import Card from "../Card";
import Styles from "./Notification.module.scss";

/**
 * A layout for the notification card
 * Displays messages to the user in a styled card format
 **/
export default function Notification({
  type,
  children
}: PropsWithChildren<{ type: "success" }>) {
  return <Card className={`${Styles.container} ${Styles[type]}`}>{children}</Card>;
}
