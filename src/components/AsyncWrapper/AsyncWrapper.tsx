import React, { PropsWithChildren } from "react";
import { useOneUIContext } from "../../context/OneUIProvider";
import AdaptiveDialog from "../AdaptiveDialog";
import Button from "../Button";
import Loader from "../Loader";
import Text from "../Text";

/**
 * This is a generic implementation of the loading, and error handling
 * 
 * This component wraps your content and shows a loading spinner while data is being fetched.
 * If an error occurs, it displays an error message with a retry button.
 * It handles both the loading state and error state in one place.
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
