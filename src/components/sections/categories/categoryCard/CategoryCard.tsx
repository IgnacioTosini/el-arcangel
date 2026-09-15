import Image from 'next/image';
import Link from 'next/link';
import './_categoryCard.scss';

export type CategoryCardProps = {
    name: string;
    slug: string;
    imageUrl: string;
};

export default function CategoryCard({ name, slug, imageUrl }: CategoryCardProps) {
    return (
        <Link href={`/catalogo?categoria=${encodeURIComponent(slug)}`} className="categoryCardContent">
            <picture className="categoryCardPicture">
                <Image
                    src={imageUrl}
                    alt=""
                    className="categoryCardImage"
                    width={640}
                    height={640}
                    sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, (max-width: 1280px) 20vw, 234px"
                />
            </picture>
            <h3 className="categoryCardTitle">{name}</h3>
        </Link>
    );
}
