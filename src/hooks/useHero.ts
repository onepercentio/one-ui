import { CSSProperties, useCallback, useEffect, useRef } from "react";

const ID = (id: string) => `${id}-hero`;

/**
 * This hook implements the logic for a hero animation between 2 elements
 */
export default function useHero(
  id: string,
  propsToTransition: Omit<
    keyof CSSProperties,
    "width" | "height" | "top" | "left"
  >[] = [],
  events: {
    onHeroEnd?: () => void;
    onHeroStart?: (clone: HTMLDivElement) => void;
  } = {}
) {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    heroRef.current!.setAttribute("data-hero", id);
  }, [id]);

  const getHerosOnScreen = useCallback(() => {
    const otherElements = Array.from(
      document.querySelectorAll(`[data-hero="${id}"]`)
    ) as HTMLDivElement[];
    return otherElements;
  }, [id]);

  useEffect(() => {
    const allPropsToTransition = [
      "width",
      "height",
      "top",
      "left",
      ...propsToTransition,
    ];
    const otherElements = getHerosOnScreen();
    if (process.env.NODE_ENV === "development" && otherElements.length > 2)
      console.warn(
        "There are too many elements to transition to, I will transition to the first I find",
        otherElements
      );
    const otherElement = otherElements.find(
      (el) => el !== heroRef.current!
    ) as HTMLDivElement;

    if (otherElement) {
      const oldClone = document.querySelector(`[data-hero-clone="${ID(id)}"]`);
      const clone = (oldClone ||
        otherElement.cloneNode(true)) as HTMLDivElement;

      // Clean up thos properties that can cause confusion since it's a clone
      clone.style.visibility = "";
      clone.removeAttribute("data-hero");

      clone.setAttribute("data-hero-clone", ID(id));

      // Since a transition is now triggering from the old element, he cannot be considered for other transitions
      otherElement.removeAttribute("data-hero");

      /**
       *
       * @param el
       * @returns Returns if it will move
       */
      function setCloneToCoordinates(el: HTMLDivElement) {
        const coordinates = el.getBoundingClientRect();
        const currentCoordinates = clone.getBoundingClientRect();
        const willNotMove =
          coordinates.top === currentCoordinates.top &&
          coordinates.top === currentCoordinates.top &&
          coordinates.top === currentCoordinates.top &&
          coordinates.top === currentCoordinates.top;

        clone.style.position = "fixed";
        clone.style.top = `${coordinates.top}px`;
        clone.style.left = `${coordinates.left}px`;
        clone.style.width = `${coordinates.width}px`;
        clone.style.height = `${coordinates.height}px`;

        return !willNotMove;
      }

      if (!oldClone) {
        setCloneToCoordinates(otherElement);
        document.body.appendChild(clone);
      }
      heroRef.current!.style.visibility = "hidden";
      otherElement.style.visibility = "hidden";

      clone.style.transition = `${allPropsToTransition
        .map((prop) => `${prop} var(--animation--speed-fast, 250ms) ease-out`)
        .join(", ")}`;

      setTimeout(() => {
        const cleanup = () => {
          if (events.onHeroEnd) events.onHeroEnd();
          clone.remove();
          el.style.visibility = "";
        };
        if (events.onHeroStart) events.onHeroStart(clone);
        if (!heroRef.current) return;
        const el = heroRef.current;
        const willMove = setCloneToCoordinates(el);
        if (!willMove) cleanup();
        else {
          for (let propToTransition of propsToTransition)
            clone.style[propToTransition as any] =
              el.style[propToTransition as any];
          clone.addEventListener(
            "transitionend",
            ({ target, currentTarget }: TransitionEvent) => {
              if (target === currentTarget) cleanup();
            }
          );
        }
      }, 100);
    }
  }, []);

  return { heroRef, getHerosOnScreen };
}
