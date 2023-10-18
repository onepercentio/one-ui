import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import ownEvent from "../utils/ownEvent";
import Styles from "./useHero.module.scss";

const ID = (id: string) => `${id}-hero`;
type ShouldSkip = boolean;
type Result = [
  originContainer: Element | VisualViewport,
  targetContainer: Element | VisualViewport
];
const viewport = window.visualViewport!;
const DATA_TAG_HERO_COMPONENT = "data-hero-component";

function triggerDynamicComponents(
  clone: HTMLDivElement,
  componentsThatWillAppear: HTMLDivElement[]
) {
  const idsThatWillAppear = componentsThatWillAppear.map((a) =>
    a.getAttribute(DATA_TAG_HERO_COMPONENT)
  );
  const preexistingComponents = Array.from(
    clone.querySelectorAll(`[${DATA_TAG_HERO_COMPONENT}]`)
  ) as HTMLDivElement[];
  const removedElements: HTMLDivElement[] = preexistingComponents.filter(
    (el) =>
      !idsThatWillAppear.includes(el.getAttribute(DATA_TAG_HERO_COMPONENT))
  );

  for (let elementThatIsBeingRemoved of removedElements) {
    elementThatIsBeingRemoved.style.height = `${elementThatIsBeingRemoved.clientHeight}px`;
  }
  setTimeout(() => {
    for (let elementThatIsBeingRemoved of removedElements) {
      elementThatIsBeingRemoved.style.height = `0px`;
      elementThatIsBeingRemoved.style.opacity = `0`;
    }
  }, 0);

  for (let componentThatWillAppear of componentsThatWillAppear) {
    const alreadyInjectedElement = !!clone.querySelector(
      `[${DATA_TAG_HERO_COMPONENT}="${componentThatWillAppear.getAttribute(
        DATA_TAG_HERO_COMPONENT
      )}"]`
    );
    if (!alreadyInjectedElement) {
      const targetElementClone = componentThatWillAppear.cloneNode(
        true
      ) as HTMLDivElement;
      targetElementClone.style.height = "0px";
      const shouldBeInsrtedAtIndex = Array.from(
        componentThatWillAppear.parentElement!.children
      ).indexOf(componentThatWillAppear);
      const remainingIndexes = Array.from(clone.children)
        .map((el, i) =>
          removedElements.includes(el as HTMLDivElement) ? undefined : i
        )
        .filter((e) => e !== undefined) as number[];

      if (shouldBeInsrtedAtIndex === remainingIndexes.length)
        clone.append(targetElementClone);
      else
        clone.insertBefore(
          targetElementClone,
          clone.childNodes.item(remainingIndexes[shouldBeInsrtedAtIndex])
        );
      setTimeout(() => {
        targetElementClone.style.height = `${componentThatWillAppear.clientHeight}px`;
      }, 0);
    }
  }
}

const ALWAYS_TRANSITION = ["top", "left"];

/**
 * This hook implements the logic for a hero animation between 2 elements
 */
export default function useHero(
  id: string,
  options: Partial<{
    propsToTransition: Exclude<
      keyof CSSProperties,
      "width" | "height" | "top" | "left"
    >[];
    /** If set, the default properties (width, height, etc...) will not transition, and propsToTransition will be the only ones that will be transitioned */
    overridePropsToTransition: boolean;

    "data-preffix": string;
    /** This indicates this hero animation will probably be repeated multiple time */
    repeatable: boolean;
  }> = {
    propsToTransition: [],
  },
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

    /** Do somethign with the clone before it goes to the html */
    onHeroCloned?: (clone: HTMLDivElement) => void;

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
     * Called when a hero is skipped
     */
    onHeroSkipped?: () => void;

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
  const {
    propsToTransition = [],
    "data-preffix": dataPreffix,
    repeatable,
  } = options;
  const _dataPreffix = dataPreffix ? `-${dataPreffix}` : "";
  const dataProperty = `data${_dataPreffix}-hero`;
  const heroRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    heroRef.current!.setAttribute(dataProperty, id);
  }, [id]);

  const getHerosOnScreen = useCallback(() => {
    const otherElements = (
      Array.from(
        document.querySelectorAll(`[${dataProperty}="${id}"]`)
      ) as HTMLDivElement[]
    ).filter((el) => el !== heroRef.current);
    return otherElements;
  }, [id]);

  function triggerHeroAnimation() {
    const allPropsToTransition = options.overridePropsToTransition
      ? [...ALWAYS_TRANSITION, ...propsToTransition]
      : ["width", "height", ...ALWAYS_TRANSITION, ...propsToTransition];
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
        isElementOutsideContainer(targetContainer, currentElCoordinates) ||
        isElementOutsideContainer(
          originContainer,
          otherElement.getBoundingClientRect()
        )
          ? (events.onHeroSkip || (() => true))(otherElement, heroRef.current!)
          : false;
      if (shouldSkip) {
        events.onHeroSkipped?.();
        return;
      }
      const oldClone = document.querySelector(
        `[${dataProperty}-clone="${ID(id)}"]`
      );
      const clone = (oldClone ||
        otherElement.cloneNode(true)) as HTMLDivElement;

      if (events.onHeroCloned && !oldClone) events.onHeroCloned(clone);

      // Clean up thos properties that can cause confusion since it's a clone
      clone.style.visibility = "";
      clone.removeAttribute(dataProperty);

      clone.setAttribute(`${dataProperty}-clone`, ID(id));

      /**
       * If it's repeatable, we should keep the flag that indicates the hero existance
       */
      if (!repeatable)
        // Since a transition is now triggering from the old element, he cannot be considered for other transitions
        otherElement.removeAttribute(dataProperty);

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
        if (allPropsToTransition.includes("width"))
          clone.style.width = `${coordinates.width}px`;
        if (allPropsToTransition.includes("height"))
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
        .map(
          (prop) =>
            `${prop.replace(
              /[A-Z]/g,
              (sub) => `-${sub.toLowerCase()}`
            )} var(--animation--speed-fast, 250ms) ease-out`
        )
        .join(", ")}`;

      setTimeout(() => {
        const el = heroRef.current;
        const cleanup = () => {
          if (events.onHeroEnd) events.onHeroEnd();
          if (el) {
            if (repeatable) el!.setAttribute(dataProperty, id);
            el.style.visibility = "";
          }
          setTimeout(() => {
            clone.remove();
          }, 0);
        };
        if (events.onHeroStart) {
          events.onHeroStart(clone, otherElement, heroRef.current!);
        }
        triggerDynamicComponents(
          clone,
          Array.from(
            heroRef.current!.querySelectorAll(`[${DATA_TAG_HERO_COMPONENT}]`)
          ) as HTMLDivElement[]
        );
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
              window.getComputedStyle(el)[propToTransition as any];
          let initialOffset: number;
          const s = ({ target }: MouseEvent) => {
            const d = target as HTMLDivElement;
            if (d.contains(el)) {
              if (initialOffset === undefined) initialOffset = d.scrollTop;
              else
                clone.style.marginTop = `${-(d.scrollTop - initialOffset)}px`;
            }
          };
          const transitionEndCb = ownEvent(
            ({ target, currentTarget }: TransitionEvent) => {
              if (target === currentTarget) cleanup();
              document.removeEventListener("scroll", s as any, true);
            }
          );
          document.addEventListener("scroll", s as any, true);
          clone.addEventListener("transitionend", transitionEndCb);
          clone.addEventListener("transitionstart", () => {
            const onCancelCb = ownEvent((e) => {
              clone.removeEventListener("transitionend", transitionEndCb);
              clone.removeEventListener("transitioncancel", onCancelCb);
            });
            clone.addEventListener("transitioncancel", onCancelCb);
          });
        }
      }, 0);
    }
  }

  useEffect(() => {
    triggerHeroAnimation();
  }, []);

  return {
    heroRef,
    getHerosOnScreen,
    trigger: triggerHeroAnimation,
    heroComponentRef:
      (componentId: string) => (elRef: HTMLDivElement | null) => {
        if (elRef) {
          elRef.setAttribute(DATA_TAG_HERO_COMPONENT, componentId);
          elRef.classList.add(Styles.component);
        }
      },
  };
}

function isElementOutsideViewport(coordinates: DOMRect) {
  const elementOverflowsViewport =
    coordinates.left >= viewport.width || coordinates.top >= viewport.height;
  const elementUnderflowsViewport =
    coordinates.left <= -coordinates.width ||
    coordinates.top <= -coordinates.height;
  return elementOverflowsViewport || elementUnderflowsViewport;
}

function isElementOutsideContainer(
  container: VisualViewport | Element,
  coordinates: DOMRect
) {
  if (container instanceof VisualViewport) {
    return isElementOutsideViewport(coordinates);
  } else {
    const containerBounds = container.getBoundingClientRect();

    const isContainerOutsideViewport =
      isElementOutsideViewport(containerBounds);

    if (isContainerOutsideViewport) return true;

    const elementOverflowsViewport =
      coordinates.left >= containerBounds.left + containerBounds.width ||
      coordinates.top >= containerBounds.top + containerBounds.height;

    const elementUnderflowsViewport =
      containerBounds.left - coordinates.left >= coordinates.width ||
      containerBounds.top - coordinates.top >= coordinates.height;

    return elementUnderflowsViewport || elementOverflowsViewport;
  }
}

type EVENTS_INTERFACE = Parameters<typeof useHero>[2];
type TRANSITION_TYPES = "ACCELERATION";
function centerPoint(rect: DOMRect) {
  return [rect.left + rect.width / 2, rect.top + rect.height / 2] as const;
}
const angle = (
  pointA: readonly [x: number, y: number],
  pointB: readonly [x: number, y: number]
) =>
  Number(
    (
      Math.atan2(pointA[1] - pointB[1], pointA[0] - pointB[0]) *
      (179.08 / Math.PI)
    ).toFixed(5)
  );
export const TRANSITION_FACTORY: {
  [n in TRANSITION_TYPES]: (events?: EVENTS_INTERFACE) => EVENTS_INTERFACE;
} = {
  ACCELERATION: (events) => ({
    ...events,
    onHeroStart(clone, origin, target) {
      if (events?.onHeroStart) events.onHeroStart(clone, origin, target);
      clone.classList.add(Styles.acceleration);
      const centerPointOrigin = centerPoint(origin.getBoundingClientRect());
      const centerPointDestination = centerPoint(
        target.getBoundingClientRect()
      );
      const angleBetweenElements = angle(
        centerPointOrigin,
        centerPointDestination
      );
      const vectorX = Math.sin(angleBetweenElements);
      const vectorY = Math.cos(angleBetweenElements);

      const rotateY = (10 * vectorY).toFixed(0);
      const originX = (vectorY + 1) * 50;

      const rotateX = -(10 * vectorX).toFixed(0);
      const originY = (vectorX + 1) * 50;

      clone.style.setProperty(
        "--stage-1",
        `rotateY(${rotateY}deg) rotateX(${-rotateX}deg)`
      );
      clone.style.setProperty(
        "--stage-2",
        `rotateY(${-rotateY * 0.3}deg) rotateX(${rotateX * 0.3}deg)`
      );
      clone.style.setProperty("--origin-1", `${originX}% ${originY}%`);
      clone.style.setProperty(
        "--origin-2",
        `${100 - originX}% ${100 - originY}%`
      );
      document.body.style.perspective = "100vw";
    },
    onHeroEnd() {
      if (events?.onHeroEnd) events.onHeroEnd();
      document.body.style.perspective = "";
    },
  }),
};
