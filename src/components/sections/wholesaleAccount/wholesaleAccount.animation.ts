import type { ComponentAnimation } from '@/lib/use-animation';

export const animateWholesaleAccount: ComponentAnimation = (root, gsap) => {
    const targets = root.querySelectorAll('.wholesaleAccountEyebrow, h1');
    if (!targets.length) return;
    targets.forEach(target => {
        gsap.from(target, { y: 42, opacity: 0, duration: 0.9, ease: 'power3.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: target, start: 'top 88%', once: true } });
    });
};
