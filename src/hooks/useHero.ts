import { CSSProperties, useCallback, useEffect, useRef } from "react";

const ID = (id: string) => `${id}-hero`;
type ShouldSkip = boolean;

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
    /**
     * Returns if the element should be "heroed"
     *
     * Usefull for when the hero has 2 possible origins.
     * For example, one could hero only the current hovered element with el.matches(":hover")
     */
    onHeroDetect?: (el: HTMLDivElement) => boolean;

    /**
     * Do something when the hero ends
     *
     * Usefull for triggering secondary animations
     */
    onHeroEnd?: () => void;

    /**
     * Do something when the hero starts the transition
     * Here it's usefull to switch classNames with the target.
     *
     * If done correctly, it will transition from state a to b smoothly
     */
    onHeroStart?: (clone: HTMLDivElement) => void;

    /**
     * Is called when the hero is coming/going outside the viewport
     *
     * By default it's set to skip all heroes that have these conditions
     *
     * @returns If the hero should be skipped or not
     */
    onHeroSkip?: (origin: HTMLDivElement, target: HTMLDivElement) => ShouldSkip;
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
    const viewport = window.visualViewport!;
    const allPropsToTransition = [
      "width",
      "height",
      "top",
      "left",
      ...propsToTransition,
    ];
    const otherElements = getHerosOnScreen().filter(
      events.onHeroDetect || (() => true)
    );
    const currentElCoordinates = heroRef.current!.getBoundingClientRect();

    if (process.env.NODE_ENV === "development" && otherElements.length > 2)
      console.warn(
        "There are too many elements to transition to, I will transition to the first I find",
        otherElements
      );
    const otherElement = otherElements.find(
      (el) => el !== heroRef.current!
    ) as HTMLDivElement;

    if (otherElement) {
      const shouldSkip =
        isElementOutsideViewport(viewport, currentElCoordinates) ||
        isElementOutsideViewport(viewport, otherElement.getBoundingClientRect())
          ? (events.onHeroSkip || (() => true))(otherElement, heroRef.current!)
          : false;
      if (shouldSkip) return;
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
          coordinates.left === currentCoordinates.left &&
          coordinates.width === currentCoordinates.width &&
          coordinates.height === currentCoordinates.height;

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
      }, 0);
    }
  }, []);

  return { heroRef, getHerosOnScreen };
}

function isElementOutsideViewport(
  viewport: VisualViewport,
  coordinates: DOMRect
) {
  const elementOverflowsViewport =
    coordinates.left >= viewport.width || coordinates.top >= viewport.height;
  const elementUnderflowsViewport =
    coordinates.left <= -coordinates.width ||
    coordinates.top <= -coordinates.height;

  return elementOverflowsViewport || elementUnderflowsViewport;
}
