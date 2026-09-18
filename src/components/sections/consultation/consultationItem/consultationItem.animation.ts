import type { ComponentAnimation } from '@/lib/use-animation';

export const animateConsultationItem: ComponentAnimation = (root, gsap) => {
    gsap.from(root, { x: -24, opacity: 0, duration: 0.5, ease: 'power3.out', clearProps: 'transform,opacity' });
};
