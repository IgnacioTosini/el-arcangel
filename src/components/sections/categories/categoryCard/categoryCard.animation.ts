import type { ComponentAnimation } from "@/lib/use-animation";

export const animateCategoryCard: ComponentAnimation = (root, gsap) => {
  gsap.from(root, {
    y: 56,
    scale: 0.93,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
    clearProps: "transform,opacity",
    scrollTrigger: { trigger: root, start: "top 88%", once: true },
  });
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    gsap.fromTo(
      root.querySelector("img"),
      { scale: 1.14 },
      {
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top 88%",
          end: "center center",
          scrub: 0.6,
        },
      },
    );
    return;
  }
  const hover = gsap
    .timeline({ paused: true })
    .to(root.querySelector("img"), {
      scale: 1.1,
      rotation: 2,
      duration: 0.5,
      ease: "power2.out",
    });
  const enter = () => {
    hover.play();
  };
  const leave = () => {
    hover.reverse();
  };
  root.addEventListener("pointerenter", enter);
  root.addEventListener("pointerleave", leave);
  return () => {
    root.removeEventListener("pointerenter", enter);
    root.removeEventListener("pointerleave", leave);
  };
};
