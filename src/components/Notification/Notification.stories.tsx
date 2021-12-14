import React from "react";
import Notification from "./Notification";

export default {
  component: Notification,
  title: "Notification",
};

export const InitialImplementation = (args: any) => <div style={{height: "250px"}}>
  <Notification {...args}>Exemplo de notificação</Notification>
</div>;
InitialImplementation.args = {
  type: "success",
} as Partial<React.ComponentProps<typeof Notification>>;
