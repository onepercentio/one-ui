import React, { PropsWithChildren } from "react";
import { useOneUIContext } from "../../context/OneUIProvider";
import AdaptiveDialog from "../AdaptiveDialog";
import Button from "../Button";
import Loader from "../Loader";
import Text from "../Text";
import Styles from "./AsyncWrapper.module.scss";

/**
 * This is a generic implementation of the loading, and error handling
 **/
export default function AsyncWrapper({
  loading,
  error,
  onClose,
  onRetry,
  children,
}: PropsWithChildren<{
  loading: boolean;
  error: boolean;
  onClose: () => void;
  onRetry: () => void;
}>) {
  const {
    LoadingComponent = Loader,
    messages,
  } = useOneUIContext().component.asyncWrapper;

  return (
    <>
      {children}
      <AdaptiveDialog open={error} onClose={onClose}>
        <Text type="highlightTitle">{messages.error.title}</Text>
        <Button onClick={() => onRetry()}>{messages.error.retryBtn}</Button>
      </AdaptiveDialog>
      {loading ? <LoadingComponent /> : null}
    </>
  );
}
