import type { ComponentAnimation } from "@/lib/use-animation";

export const animateWholesale: ComponentAnimation = (root, gsap) => {
  const targets = root.querySelectorAll(
    ".wholesaleTitle, .wholesaleDescription, .wholesaleButton",
  );
  if (!targets.length) return;
  targets.forEach((target) => {
    gsap.from(target, {
      y: 59,
      opacity: 0,
      duration: 1.1,
      ease: "power3.out",
      clearProps: "transform,opacity",
      scrollTrigger: { trigger: target, start: "top 88%", once: true },
    });
  });
};
