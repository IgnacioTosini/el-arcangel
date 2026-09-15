import CategoryCard, { type CategoryCardProps } from './categoryCard/CategoryCard';
import './_categories.scss';

export default function Categories({ categories }: { categories: CategoryCardProps[] }) {
    return (
        <section className="categoriesContent" aria-labelledby="categoriesTitle">
            <h2 id="categoriesTitle" className="categoriesTitle">Categorías</h2>
            <ul className="categoriesGrid">
                {categories.map((category) => (
                    <li key={category.slug} className="categoriesItem">
                        <CategoryCard {...category} />
                    </li>
                ))}
            </ul>
        </section>
    );
}
