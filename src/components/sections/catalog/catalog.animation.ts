import type { ComponentAnimation } from "@/lib/use-animation";

export const animateCatalog: ComponentAnimation = (root, gsap) => {
  const targets = root.querySelectorAll(".catalogHeader");
  if (!targets.length) return;
  targets.forEach((target) => {
    gsap.from(target, {
      y: 44,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      clearProps: "transform,opacity",
      scrollTrigger: { trigger: target, start: "top 88%", once: true },
    });
  });
};
