import type { ComponentAnimation } from "@/lib/use-animation";

export const animateWholesaleGuide: ComponentAnimation = (root, gsap) => {
  const targets = root.querySelectorAll(
    ".wholesaleGuideHeader, .wholesaleGuideSteps > li",
  );
  if (!targets.length) return;
  targets.forEach((target) => {
    gsap.from(target, {
      y: 52,
      opacity: 0,
      duration: 1.0,
      ease: "power3.out",
      clearProps: "transform,opacity",
      scrollTrigger: { trigger: target, start: "top 88%", once: true },
    });
  });
};
