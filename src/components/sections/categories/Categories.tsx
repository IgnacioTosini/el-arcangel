"use client";
import { defaultHomeContent } from "@/lib/home-content";
import { useAnimation } from "@/lib/use-animation";

import { animateCategories } from "./categories.animation";
import CategoryCard, {
  type CategoryCardProps,
} from "./categoryCard/CategoryCard";

import "./_categories.scss";

export default function Categories({
  categories,
  title = defaultHomeContent.categoriesTitle,
}: {
  categories: CategoryCardProps[];
  title?: string;
}) {
  const animationRef = useAnimation<HTMLElement>(animateCategories);
  return (
    <section
      ref={animationRef}
      className="categoriesContent"
      aria-labelledby="categoriesTitle"
    >
      <h2 id="categoriesTitle" className="categoriesTitle">
        {title}
      </h2>
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
