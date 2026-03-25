/** Checks if the event target matches the current target */
export function isSameTarget({ target, currentTarget }: Event) {
  return target === currentTarget;
}