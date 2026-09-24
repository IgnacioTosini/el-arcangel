import type { ComponentAnimation } from "@/lib/use-animation";

export const animateFooter: ComponentAnimation = (root, gsap) => {
  // Keep the bottom credit visible: it cannot reach a trigger above the viewport's bottom.
  const targets = root.querySelectorAll(
    ".footerBrand, .footerSections, .footerContact",
  );
  if (!targets.length) return;
  targets.forEach((target) => {
    gsap.from(target, {
      y: 44,
      opacity: 0,
      duration: 1.0,
      ease: "power3.out",
      clearProps: "transform,opacity",
      scrollTrigger: { trigger: target, start: "top 88%", once: true },
    });
  });
};
