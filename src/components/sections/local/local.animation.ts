import type { ComponentAnimation } from "@/lib/use-animation";

export const animateLocal: ComponentAnimation = (root, gsap) => {
  const targets = root.querySelectorAll(
    ".localTitle, .localDescription, .localDetail",
  );
  if (!targets.length) return;
  targets.forEach((target) => {
    gsap.from(target, {
      y: 46,
      opacity: 0,
      duration: 0.95,
      ease: "power3.out",
      clearProps: "transform,opacity",
      scrollTrigger: { trigger: target, start: "top 88%", once: true },
    });
  });
};
