'use client';
import Link from 'next/link';

import { defaultHomeContent, type HomeContent } from '@/lib/home-content';
import { useAnimation } from '@/lib/use-animation';

import { animateWholesale } from './wholesale.animation';

import './_wholesale.scss';

export default function Wholesale({ content = defaultHomeContent }: { content?: HomeContent }) {
    const animationRef = useAnimation<HTMLElement>(animateWholesale);
    return (
        <section ref={animationRef} className="wholesaleContent" aria-labelledby="wholesaleTitle">
            <div className="wholesaleInner">
                <h2 id="wholesaleTitle" className="wholesaleTitle">{content.wholesaleTitle}</h2>
                <p className="wholesaleDescription">{content.wholesaleDescription}</p>
                <Link href="/mayoristas" className="wholesaleButton">{content.wholesaleButton}</Link>
            </div>
        </section>
    );
}
