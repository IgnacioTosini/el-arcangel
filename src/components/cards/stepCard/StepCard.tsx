import './_stepCard.scss';

export type StepCardProps = {
    number: number;
    title: string;
    description: string;
};

export default function StepCard({ number, title, description }: StepCardProps) {
    return (
        <div className="stepCardContent">
            <h2 className="stepCardTitle">{number}. {title}</h2>
            <p className="stepCardDescription">{description}</p>
        </div>
    );
}
