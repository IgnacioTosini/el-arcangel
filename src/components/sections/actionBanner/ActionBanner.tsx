import Link from 'next/link';
import './_actionBanner.scss';

type BannerAction = {
    label: string;
    href: string;
};

type ActionBannerProps = {
    title: string;
    description: string;
    primaryAction: BannerAction;
    secondaryAction?: BannerAction;
};

export default function ActionBanner({ title, description, primaryAction, secondaryAction }: ActionBannerProps) {
    return (
        <section className="actionBannerContent" aria-label={title}>
            <h2 className="actionBannerTitle">{title}</h2>
            <p className="actionBannerDescription">{description}</p>
            <div className="actionBannerButtons">
                <Link href={primaryAction.href} className="actionBannerButton">{primaryAction.label}</Link>
                {secondaryAction && (
                    <Link href={secondaryAction.href} className="actionBannerButton actionBannerButtonSecondary">
                        {secondaryAction.label}
                    </Link>
                )}
            </div>
        </section>
    );
}
