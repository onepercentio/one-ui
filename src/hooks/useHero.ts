import {
  CSSProperties,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";

const ID = (id: string) => `${id}-hero`;
type ShouldSkip = boolean;
type Result = [
  originContainer: Element | VisualViewport,
  targetContainer: Element | VisualViewport
];

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
     * Should return if the detected element should be "heroed"
     *
     * Usefull for when the hero has 2 possible origins.
     * For example, one could hero only the current hovered element with el.matches(":hover")
     */
    onHeroDetect?: (origin: HTMLDivElement, target: HTMLDivElement) => boolean;

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
    onHeroStart?: (
      clone: HTMLDivElement,
      origin: HTMLDivElement,
      target: HTMLDivElement
    ) => void;

    /**
     * Is called when the hero is coming/going outside the viewport
     *
     * By default it's set to skip all heroes that have these conditions
     *
     * @returns If the hero should be skipped or not
     */
    onHeroSkip?: (origin: HTMLDivElement, target: HTMLDivElement) => ShouldSkip;

    /**
     * Before transition start, setup the properties that will be used for hero animation
     * @returns The container that will be used to check if the hero is out or in the view
     */
    onBeforeTransition?: (
      origin: HTMLDivElement,
      target: HTMLDivElement
    ) => Result | Readonly<Result>;
  } = {}
) {
  const heroRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    heroRef.current!.setAttribute("data-hero", id);
  }, [id]);

  const getHerosOnScreen = useCallback(() => {
    const otherElements = (
      Array.from(
        document.querySelectorAll(`[data-hero="${id}"]`)
      ) as HTMLDivElement[]
    ).filter((el) => el !== heroRef.current);
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
    const shouldHeroFn = events.onHeroDetect || ((...a: any[]) => true);
    const otherElements = getHerosOnScreen().filter((el) =>
      shouldHeroFn(el, heroRef.current!)
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
      const [originContainer, targetContainer] = events.onBeforeTransition
        ? events.onBeforeTransition(otherElement, heroRef.current!)
        : [viewport, viewport];
      const shouldSkip =
        isElementOutsideViewport(targetContainer, currentElCoordinates) ||
        isElementOutsideViewport(
          originContainer,
          otherElement.getBoundingClientRect()
        )
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

      function willTheHeroMove(origin: DOMRect, target: DOMRect) {
        return !(
          origin.top === target.top &&
          origin.left === target.left &&
          origin.width === target.width &&
          origin.height === target.height
        );
      }

      /**
       *
       * @param el
       * @returns Returns if it will move
       */
      function setCloneToCoordinatesOf(el: HTMLDivElement) {
        const coordinates = el.getBoundingClientRect();
        const currentCoordinates = clone.getBoundingClientRect();
        const willMove = willTheHeroMove(coordinates, currentCoordinates);

        clone.style.position = "fixed";
        clone.style.top = `${coordinates.top}px`;
        clone.style.left = `${coordinates.left}px`;
        clone.style.width = `${coordinates.width}px`;
        clone.style.height = `${coordinates.height}px`;

        return willMove;
      }

      const coordinates = otherElement.getBoundingClientRect();
      const currentCoordinates = heroRef.current!.getBoundingClientRect();
      const itWontMove = !willTheHeroMove(coordinates, currentCoordinates);
      if (itWontMove) return;

      if (!oldClone) {
        /** Set the clone over the starting element */
        setCloneToCoordinatesOf(otherElement);
        document.body.appendChild(clone);
      }
      heroRef.current!.style.visibility = "hidden";
      otherElement.style.visibility = "hidden";

      clone.style.transition = `${allPropsToTransition
        .map((prop) => `${prop} var(--animation--speed-fast, 250ms) ease-out`)
        .join(", ")}`;

      setTimeout(() => {
        const el = heroRef.current;
        const cleanup = () => {
          if (events.onHeroEnd) events.onHeroEnd();
          clone.remove();
          if (el) el.style.visibility = "";
        };
        if (events.onHeroStart)
          events.onHeroStart(clone, otherElement, heroRef.current!);
        if (!el) {
          cleanup();
          return;
        }
        /** Set the clone over the new position */
        const willMove = setCloneToCoordinatesOf(el);
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
  viewport: VisualViewport | Element,
  coordinates: DOMRect
) {
  if (viewport instanceof VisualViewport) {
    const elementOverflowsViewport =
      coordinates.left >= viewport.width || coordinates.top >= viewport.height;
    const elementUnderflowsViewport =
      coordinates.left <= -coordinates.width ||
      coordinates.top <= -coordinates.height;
    return elementOverflowsViewport || elementUnderflowsViewport;
  } else {
    const viewportBounds = viewport.getBoundingClientRect();

    const elementOverflowsViewport =
      coordinates.left >= viewportBounds.left + viewportBounds.width ||
      coordinates.top >= viewportBounds.top + viewportBounds.height;

    const elementUnderflowsViewport =
      viewportBounds.left - coordinates.left >= coordinates.width ||
      viewportBounds.top - coordinates.top >= coordinates.height;

    return elementUnderflowsViewport || elementOverflowsViewport;
  }
}
