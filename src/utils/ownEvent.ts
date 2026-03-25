/**
 * Allows invoking a callback, only when the event is ocurring on the same elemnt
 */
// This function runs a callback only if the event happens on the element itself, not on its children.
export default function ownEvent<E extends Event>(cb: (e: E) => void) {
  return (e: E) => {
    if (e.currentTarget === e.target) cb(e);
  };
}
