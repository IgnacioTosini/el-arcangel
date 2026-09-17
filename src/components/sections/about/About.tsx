import { defaultHomeContent, type HomeContent } from '@/lib/home-content';
import './_about.scss';

type AboutProps = {
    instagramUrl?: string;
    content?: HomeContent;
};

export default function About({ instagramUrl, content = defaultHomeContent }: AboutProps) {
    return (
        <section className="aboutContent" aria-labelledby="aboutTitle">
            <h2 id="aboutTitle" className="aboutTitle">{content.aboutTitle}</h2>
            <p className="aboutDescription">{content.aboutDescription}</p>
            {instagramUrl && (
                <a href={instagramUrl} className="aboutInstagram" target="_blank" rel="noopener noreferrer">{content.aboutButton}</a>
            )}
        </section>
    );
}
