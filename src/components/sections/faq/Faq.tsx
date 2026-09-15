import './_faq.scss';

type FaqItem = {
    question: string;
    answer: string;
};

type FaqProps = {
    title?: string;
    items: FaqItem[];
};

export default function Faq({ title = 'Preguntas frecuentes', items }: FaqProps) {
    return (
        <section className="faqContent" aria-label={title}>
            <h2 className="faqTitle">{title}</h2>
            <dl className="faqList">
                {items.map(({ question, answer }) => (
                    <div className="faqItem" key={question}>
                        <dt className="faqQuestion">{question}</dt>
                        <dd className="faqAnswer">{answer}</dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}
