import React, { PropsWithChildren, useEffect, useState } from "react";
import { useOneUIContext } from "../../context/OneUIProvider";
import Collapsable from "../Collapsable";
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

type Props = PropsWithChildren<{
  optionsAlignment?: "left" | "right";
  user?: User;
  options: Option[];
  moreOptions?: MoreOptions;
  /**
   * This controls the visbility of a control for showing or hiding a menu on mobile
   */
  responsive?: boolean;
}>;

/**
 * A generic header implementation
 **/
export default function Header(props: Props) {
  const { user, moreOptions } = props;
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const { LogoImage = () => null, MoreOptions = () => <div>v</div> } =
    useOneUIContext().component.header;

  useEffect(() => {
    if (showMoreOptions) {
      const close = () => setShowMoreOptions(false);
      window.addEventListener("click", close);
      return () => {
        window.removeEventListener("click", close);
      };
    }
  }, [showMoreOptions]);
  return (
    <header className={`${Styles.header} ${Styles[`options-${props.optionsAlignment || "left"}`]}`}>
      <div className={Styles.logo}>
        <LogoImage />
        <div className={Styles.logoDivider} />
      </div>
      <Controls {...props} mode="desktop" />
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
      {
        <Collapsable
          title={
            <div
              className={`${Styles.indicator} ${
                moreOptions ? Styles.withMoreOptions : ""
              }`}
            >
              <MoreOptions open={showMoreOptions} />
            </div>
          }
          data-testid="more-options-container"
          open={showMoreOptions}
          onToggleOpen={setShowMoreOptions}
          mode="float"
          contentClassName={Styles.headerOptions}
        >
          <Controls {...props} mode="mobile" />
          {moreOptions
            ? moreOptions.map((opt) => (
                <Text type="link" onClick={opt.onClick}>
                  {opt.label}
                </Text>
              ))
            : null}
        </Collapsable>
      }
    </header>
  );
}

function Controls({
  options,
  children,
  mode,
}: Props & { mode: "desktop" | "mobile" }) {
  return (
    <>
      {options.map((option, i) => (
        <Text
          type="link"
          key={option.label}
          data-testid={`option-${i}`}
          onClick={option.onClick}
          className={`${Styles.option} ${
            mode === "desktop" ? Styles.desktopOnly : Styles.mobileOnly
          }`}
        >
          {option.label}
        </Text>
      ))}
      <div className={Styles.sectionDivider} />
      {children && (
        <div
          className={`${Styles.children} ${
            mode === "desktop" ? Styles.desktopOnly : Styles.mobileOnly
          }`}
        >
          {children}
        </div>
      )}
    </>
  );
}
