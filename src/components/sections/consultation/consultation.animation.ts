import type { ComponentAnimation } from '@/lib/use-animation';

export const animateConsultation: ComponentAnimation = (root, gsap) => {
    gsap.from(root.querySelectorAll('.consultationHeader, .consultationAccountBar'), { y: 24, opacity: 0, stagger: 0.12, duration: 0.65, ease: 'power3.out', clearProps: 'transform,opacity' });
};
