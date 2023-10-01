import useShortIntl from "hooks/useShortIntl";

/**
 * Typing test only
 */
it("Should give correct return type", () => {
  const { txt } = useShortIntl();

  /** Val here should be a string or react node */
  const val = txt("generic.id");
});
