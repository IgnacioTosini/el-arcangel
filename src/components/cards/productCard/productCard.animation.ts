import type { ComponentAnimation } from '@/lib/use-animation';

export const animateProductCard: ComponentAnimation = (root, gsap) => {
    const siblings = root.parentElement?.parentElement?.children;
    const index = siblings ? Array.from(siblings).indexOf(root.parentElement!) : 0;
    gsap.from(root, { y: 65, opacity: 0, scale: 0.93, duration: 1, delay: Math.max(0, index % 2) * 0.12, ease: 'power3.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: root, start: 'top 88%', once: true } });
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        gsap.fromTo(root.querySelector('img'), { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: root, start: 'top 88%', end: 'center center', scrub: 0.6 } });
        return;
    }
    const image = root.querySelector('img');
    const hover = gsap.timeline({ paused: true }).to(image, { scale: 1.085, duration: 0.55, ease: 'power2.out' });
    const enter = () => { hover.play(); };
    const leave = () => { hover.reverse(); };
    root.addEventListener('pointerenter', enter); root.addEventListener('pointerleave', leave);
    return () => { root.removeEventListener('pointerenter', enter); root.removeEventListener('pointerleave', leave); };
};
