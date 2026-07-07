import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Containers whose direct children are cards that slide in from
// alternating sides. Mark any grid with data-reveal-cards to opt in.
const CARD_CONTAINERS =
  ".features-grid, .tt-mag__grid, .faq-list, .category-cards, [data-reveal-cards]";

// Standalone cards that appear outside a known container.
const CARD_ITEMS =
  ".value-card, .vision-card, .mission-card, .resource-card, .category-card";

/**
 * Site-wide scroll reveal: sections rise up, cards slide in from the
 * sides as they enter the viewport. Renders nothing; it observes the
 * DOM under <main> and toggles CSS classes (see index.css: .sr-reveal).
 */
const ScrollReveal = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Reveals when entering the viewport; resets once the element has
    // fully left it, so the animation replays on every scroll direction.
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("sr-in");
          } else if (
            entry.boundingClientRect.top > window.innerHeight ||
            entry.boundingClientRect.bottom < 0
          ) {
            entry.target.classList.remove("sr-in");
          }
        });
      },
      { rootMargin: "0px 0px -60px 0px", threshold: 0 },
    );

    const prepare = (el, dir) => {
      if (!el) return;
      if (!el.dataset.srDone) {
        el.dataset.srDone = "1";
        el.classList.add("sr-reveal");
        if (dir) el.classList.add(dir);
      }
      // Re-observe on every effect run: StrictMode (and route changes)
      // tear the previous observer down after elements were marked done,
      // which would otherwise leave them permanently hidden.
      io.observe(el);
    };

    const scan = () => {
      const main = document.querySelector("main");
      if (!main) return;

      main
        .querySelectorAll("section:not([data-no-reveal])")
        .forEach((el) => prepare(el));

      main.querySelectorAll(CARD_CONTAINERS).forEach((container) => {
        Array.from(container.children).forEach((child, i) =>
          prepare(child, i % 2 === 0 ? "sr-left" : "sr-right"),
        );
      });

      main
        .querySelectorAll(CARD_ITEMS)
        .forEach((el, i) => prepare(el, i % 2 === 0 ? "sr-left" : "sr-right"));
    };

    scan();

    // Catch content that renders after mount (e.g. blog posts from the API)
    const main = document.querySelector("main");
    const mo = new MutationObserver(scan);
    if (main) mo.observe(main, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
};

export default ScrollReveal;
