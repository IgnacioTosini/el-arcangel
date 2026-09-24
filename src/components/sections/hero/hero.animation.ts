import type { ComponentAnimation } from "@/lib/use-animation";

export const animateHero: ComponentAnimation = (root, gsap) => {
  const timeline = gsap.timeline({
    defaults: {
      ease: "power3.out",
      duration: 1.15,
      clearProps: "transform,opacity",
    },
  });
  timeline
    .from(root.querySelector(".heroTitle"), {
      y: 78,
      opacity: 0,
      duration: 1.35,
    })
    .from(root.querySelector(".heroSubtitle"), { y: 44, opacity: 0 }, "-=0.85")
    .from(
      root.querySelectorAll(".heroButton"),
      { y: 34, opacity: 0, stagger: 0.16 },
      "-=0.75",
    );
  const picture = root.querySelector(".heroPicture");
  gsap.from(picture, {
    y: 55,
    scale: 0.88,
    opacity: 0,
    duration: 1.35,
    ease: "power3.out",
    clearProps: "transform,opacity",
    scrollTrigger: { trigger: picture, start: "top 86%", once: true },
  });
  gsap.fromTo(
    root.querySelector(".heroImage"),
    { scale: 1.16 },
    {
      scale: 1,
      ease: "none",
      scrollTrigger: {
        trigger: picture,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
    },
  );
};
