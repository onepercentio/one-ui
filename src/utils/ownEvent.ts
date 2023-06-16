/**
 * Allows invoking a callback, only when the event is ocurring on the same elemnt
 */
export default function ownEvent<E extends Event>(cb: (e: E) => void) {
  return (e: E) => {
    if (e.currentTarget === e.target) cb(e);
  };
}
