import { defaultHomeContent, type HomeContent } from '@/lib/home-content';
import Link from 'next/link';
import './_wholesale.scss';

export default function Wholesale({ content = defaultHomeContent }: { content?: HomeContent }) {
    return (
        <section className="wholesaleContent" aria-labelledby="wholesaleTitle">
            <div className="wholesaleInner">
                <h2 id="wholesaleTitle" className="wholesaleTitle">{content.wholesaleTitle}</h2>
                <p className="wholesaleDescription">{content.wholesaleDescription}</p>
                <Link href="/mayoristas" className="wholesaleButton">{content.wholesaleButton}</Link>
            </div>
        </section>
    );
}
