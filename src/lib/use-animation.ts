'use client';
import { useEffect, useRef } from 'react';

import type { gsap } from 'gsap';

export type ComponentAnimation = (root: HTMLElement, motion: typeof gsap) => void | (() => void);

/** Components own their choreography; this hook only loads GSAP and handles cleanup. */
export function useAnimation<T extends HTMLElement = HTMLDivElement>(animate: ComponentAnimation, revision: string | number = '') {
    const ref = useRef<T>(null);
    useEffect(() => {
        if (!ref.current || typeof window.matchMedia !== 'function') return;
        let disposed = false;
        let revert: (() => void) | undefined;
        void import('./gsap').then(({ gsap }) => {
            if (disposed || !ref.current) return;
            const root = ref.current;
            const media = gsap.matchMedia();
            revert = () => media.revert();
            media.add('(prefers-reduced-motion: no-preference)', () => animate(root, gsap), root);
        }).catch(() => { revert?.(); /* Content remains usable if the animation bundle cannot load. */ });
        return () => { disposed = true; revert?.(); };
    }, [animate, revision]);
    return ref;
}
