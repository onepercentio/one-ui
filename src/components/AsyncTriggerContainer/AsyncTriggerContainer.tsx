import AdaptiveContainer from "../AdaptiveContainer";
import useAsyncControl from "../../hooks/useAsyncControl";
import {
  ComponentProps,
  CSSProperties,
  Fragment,
  PropsWithChildren,
  ReactElement,
  useEffect,
  useInsertionEffect,
  useState,
} from "react";
import Styles from "./AsyncTriggerContainer.module.scss";
import Button from "../Button";
import { useOneUIConfig } from "../../context/OneUIProvider";

/**
 * Wraps a component, triggers the provided action onMount, shows loading, and if the action fails and rejects handles the UI for error. 
 * Do not use try catch on the action as this component already handles rejections.
 * 
 * @example
 * <AsyncTriggerContainer action={anAsyncProcess}>
 *  <>This is only shown when the action finished successfully</>
 * </AsyncTriggerContainer>
 */
/**
 * A component that manages the lifecycle of an asynchronous operation.
 * It displays a loading state while the operation runs, shows the child content
 * when the operation succeeds, and provides a retry option if the operation fails.
 */
export default function AsyncTriggerContainer({
  action,
  children,
  loadingLabel,
  className,
  style,
}: PropsWithChildren<{
  action: (() => Promise<any>) | undefined;
  /** Optionally, provide a component to show while loading. If not provided, the global loading label provided at OneUIProvider will be shown.  */
  loadingLabel?: ReactElement;
  className?: string;
  style?: CSSProperties;
}>) {
  const [executed, setExecuted] = useState(false);
  const control = useAsyncControl({
    action: () => action!().then(() => setExecuted(true)),
  });
  useEffect(() => {
    if (action) control.action();
  }, [action]);
  useInsertionEffect(() => {
    if (action) control.loading = true;
  }, [action]);
  /**
   * For the future:
   * If we ever have a way to recall the function, we could display the loader again, but on a absolute position at the bottom of the page, when it already executed
   */
  return (
    <AsyncTriggerContainerView
      className={className}
      style={style}
      children={children}
      showContent={executed}
      loadingLabel={loadingLabel}
      control={control}
    />
  );
}

export function AsyncTriggerContainerView({
  className,
  children,
  style,
  showContent,
  control,
  loadingLabel,
}: Pick<
  ComponentProps<typeof AsyncTriggerContainer>,
  "className" | "children" | "style" | "loadingLabel"
> & {
  showContent: boolean;
  control: ReturnType<typeof useAsyncControl> & { action: () => void };
}) {
  const Loading = useOneUIConfig("component.asyncTriggerContainer.LoadingComponent")!;
  
  const retry = (
    <Fragment key={"error"}>
      <Button onClick={() => control.action()}>Retry</Button>
    </Fragment>
  );
  const loading = (
    <Fragment key={"loading"}>{loadingLabel || <Loading />}</Fragment>
  );
  return (
    <AdaptiveContainer
      contentClassName={`${className} relative`}
      direction="v"
      style={style}
      className={Styles.container}
    >
      {showContent ? (
        <Fragment key={"executed"}>
          {children}
          {
            <AdaptiveContainer
              direction="both"
              className={Styles.loader}
              contentClassName={Styles.loaderContainer}
            >
              {control.error ? (
                retry
              ) : control.loading ? (
                loading
              ) : (
                <Fragment key={"no"} />
              )}
            </AdaptiveContainer>
          }
        </Fragment>
      ) : control.error ? (
        retry
      ) : control.loading ? (
        loading
      ) : (
        <Fragment key={"not_exec"} />
      )}
    </AdaptiveContainer>
  );
}

