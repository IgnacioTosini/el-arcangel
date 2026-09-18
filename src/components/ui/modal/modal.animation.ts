import type { ComponentAnimation } from '@/lib/use-animation';

export const animateModal: ComponentAnimation = (root, gsap) => {
    gsap.from(root, { y: 22, scale: 0.97, opacity: 0, duration: 0.3, ease: 'power2.out', clearProps: 'transform,opacity' });
};
