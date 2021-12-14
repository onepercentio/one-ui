import React, { useState } from "react";
import { useOneUIContext } from "../../context/OneUIProvider";
import Collapsable from "../Collapsable";
import Select from "../Select";
import Text from "../Text";
import Styles from "./Header.module.scss";

type Option = {
  label: string;
  onClick: () => void;
};

type User = {
  name: string;
  profilePicture?: string;
};

type MoreOptions = Option[];

/**
 * A generic header implementation
 **/
export default function Header({
  options,
  user,
  moreOptions,
}: {
  user?: User;
  options: Option[];
  moreOptions?: MoreOptions;
}) {
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const {
    LogoImage = () => null,
    MoreOptions = () => "v",
  } = useOneUIContext().component.header;
  return (
    <header className={Styles.header}>
      <div className={Styles.logo}>
        <LogoImage />
        <div className={Styles.logoDivider} />
      </div>
      {options.map((option, i) => (
        <Text
          type="link"
          key={option.label}
          data-testid={`option-${i}`}
          onClick={option.onClick}
          className={Styles.option}
        >
          {option.label}
        </Text>
      ))}
      <div className={Styles.sectionDivider} />
      {user ? (
        user.profilePicture ? (
          <img
            className={Styles.profile}
            data-testid="profile-container"
            src={user.profilePicture!}
          />
        ) : (
          <div className={Styles.profile} data-testid="profile-container">
            {user.name
              .split(" ")
              .slice(0, 2)
              .map((a) => a.charAt(0).toUpperCase())
              .join("")}
          </div>
        )
      ) : null}
      {user ? <p className={Styles.profileName}>{user.name}</p> : null}
      {moreOptions ? (
        <Collapsable
          title={
            <div
              className={`${Styles.indicator} ${
                showMoreOptions ? Styles.open : ""
              }`}
            >
              <MoreOptions />
            </div>
          }
          data-testid="more-options-container"
          open={showMoreOptions}
          onToggleOpen={setShowMoreOptions}
          mode="float"
          contentClassName={Styles.headerOptions}
        >
          {moreOptions.map((opt) => (
            <Text type="link" onClick={opt.onClick}>
              {opt.label}
            </Text>
          ))}
        </Collapsable>
      ) : null}
    </header>
  );
}
