import type { ComponentAnimation } from "@/lib/use-animation";

export const animateNavbar: ComponentAnimation = (root, gsap) => {
  // Animate inner controls, leaving the sticky header and its positioning untouched.
  gsap.from(
    root.querySelectorAll(
      ".navbarBrand, .navbarAccount, .navbarConsultation, .navbarMenuButton",
    ),
    {
      y: -16,
      opacity: 0,
      stagger: 0.08,
      duration: 0.6,
      ease: "power2.out",
      clearProps: "transform,opacity",
    },
  );
};

export const animateNavbarCount: ComponentAnimation = (root, gsap) => {
  gsap.from(root, {
    scale: 1.4,
    duration: 0.45,
    ease: "back.out(2)",
    clearProps: "transform",
  });
};
