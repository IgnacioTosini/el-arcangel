import type { ComponentAnimation } from "@/lib/use-animation";

export const animateProductDetail: ComponentAnimation = (root, gsap) => {
  gsap.from(root.querySelector(".productGalleryContent"), {
    scale: 0.9,
    opacity: 0,
    duration: 1.15,
    ease: "power3.out",
    clearProps: "transform,opacity",
  });
  root
    .querySelectorAll(
      ".productDetailCategory, #productDetailTitle, .productDetailPrice, .productDetailDescription, .productPurchaseContent",
    )
    .forEach((target) => {
      gsap.from(target, {
        y: 42,
        opacity: 0,
        duration: 0.95,
        ease: "power3.out",
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: target, start: "top 90%", once: true },
      });
    });
};
