import React, { useEffect, useMemo, useRef } from "react";
import Styles from "./useZoomable.module.scss";
import ReactDOM from "react-dom";
import useHero from "../useHero";
import { useMergeRefsFunc } from "../useMergeRefs";
import ownEvent from "../../utils/ownEvent";

const ON_HERO_START: Parameters<typeof useHero>[2] = {
  onHeroStart: (clone) => clone.classList.add(Styles.overBackdrop),
};

/**
 * Allows an element to be zoomable for fullscreen
 */
export default function useZoomable(id: string) {
  const zoomableID = useMemo(() => `zoomable-${id}`, []);
  const getBackdrop = () => {
    return document.querySelector(
      `[data-zoomable="${zoomableID}"]`
    )! as HTMLDivElement;
  };
  const { heroRef, trigger } = useHero(
    zoomableID,
    {
      "data-preffix": "zoomable",
      repeatable: true,
    },
    {
      onHeroStart: (clone, ...args) => {
        const bd = getBackdrop();
        const removeCb = ({ currentTarget, target }: TransitionEvent) => {
          if (target === currentTarget) {
            ReactDOM.unmountComponentAtNode(bd);
            bd.remove();
          }
        };
        bd.style.opacity = "0";
        ON_HERO_START!.onHeroStart!(clone, ...args);
        const middlewayClick = () => {
          bd.removeEventListener("transitionend", removeCb);
          clone.removeEventListener("click", middlewayClick);
          _zoom();
        };
        clone.addEventListener("click", middlewayClick);
        bd.addEventListener("transitionend", removeCb);
        bd.addEventListener("transitionstart", () => {
          bd.addEventListener(
            "transitioncancel",
            ownEvent(() => bd.removeEventListener("transitionend", removeCb))
          );
        });
      },
    }
  );
  const zoomableEl = useRef<HTMLDivElement>(null);
  function _unzoom() {
    trigger();
  }

  function _zoom() {
    const el = zoomableEl.current!;
    const elClone = el.cloneNode(true) as HTMLDivElement;
    elClone.style.visibility = "hidden";

    function HeroMount() {
      const { heroRef } = useHero(
        zoomableID,
        {
          "data-preffix": "zoomable",
          repeatable: true,
        },
        {
          onHeroStart: (clone, ...args) => {
            getBackdrop().style.opacity = "1";
            ON_HERO_START!.onHeroStart!(clone, ...args);
            const unzoomCb = () => {
              _unzoom();
              clone.removeEventListener("click", unzoomCb);
            };
            clone.addEventListener("click", unzoomCb);
          },
          onHeroEnd: () => {
            heroRef.current!.classList.remove(Styles.zoomableIndicator);
          },
        }
      );

      return (
        <div
          ref={(ref) => {
            if (ref) {
              ref.appendChild(elClone);
              (heroRef as any).current = elClone;
              const verticalProportion = el.clientWidth / el.clientHeight;
              const targetWidth = ref.clientHeight * verticalProportion;

              if (targetWidth > ref.clientWidth) {
                const horizontalProportion = el.clientHeight / el.clientWidth;
                elClone.style.width = ref.clientWidth + "px";
                elClone.style.height =
                  ref.clientWidth * horizontalProportion + "px";
              } else {
                elClone.style.height = ref.clientHeight + "px";
                elClone.style.width = targetWidth + "px";
              }
            }
          }}
        />
      );
    }

    const existingBackdrop = getBackdrop();
    if (!existingBackdrop) {
      const backdrop = document.createElement("div");

      backdrop.classList.add(Styles.backdrop);
      backdrop.addEventListener("click", _unzoom);
      backdrop.setAttribute("data-zoomable", zoomableID);

      document.body.appendChild(backdrop);
      ReactDOM.render(<HeroMount />, backdrop);
    } else {
      ReactDOM.render(<HeroMount />, existingBackdrop);
    }
  }
  useEffect(() => {
    const el = zoomableEl.current!;
    el.classList.add(Styles.zoomableIndicator);
    el.addEventListener("click", _zoom);
    return () => {
      el.classList.remove(Styles.zoomableIndicator);
      const bd = getBackdrop();
      if (bd) {
        bd.style.opacity = "0";
        bd.addEventListener("transitionend", () => {
          bd.remove();
        });
      }
    };
  }, []);

  const mergedRefs = useMergeRefsFunc(heroRef, zoomableEl);

  return {
    zoomableEl: mergedRefs,
  };
}
