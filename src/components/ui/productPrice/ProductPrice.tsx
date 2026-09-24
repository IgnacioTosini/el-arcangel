import "./_productPrice.scss";

const formatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

export default function ProductPrice({
  price,
  compareAtPrice,
  priceFrom = false,
}: {
  price: number | null;
  compareAtPrice?: number | null;
  priceFrom?: boolean;
}) {
  const discounted =
    price !== null && compareAtPrice != null && compareAtPrice > price;
  return (
    <span className="productPrice">
      {discounted && (
        <del
          aria-label={`Precio anterior: ${formatter.format(compareAtPrice)}`}
        >
          {formatter.format(compareAtPrice)}
        </del>
      )}
      <span>
        {price === null
          ? "Consultar precio"
          : `${priceFrom ? "Desde " : ""}${formatter.format(price)}`}
      </span>
    </span>
  );
}
