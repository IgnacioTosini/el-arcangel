"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";

import { useAnimation } from "@/lib/use-animation";

import { type ConsultationLine, formatAmount } from "../consultationUtils";

import { animateConsultationItem } from "./consultationItem.animation";

import "./_consultationItem.scss";

type ConsultationItemProps = ConsultationLine & {
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
};

export default function ConsultationItem({
  product,
  quantity,
  onQuantityChange,
  onRemove,
}: ConsultationItemProps) {
  const animationRef = useAnimation<HTMLElement>(animateConsultationItem);
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const limit = Math.min(999, product.stock ?? 999);
  return (
    <article ref={animationRef} className="consultationItemContent">
      <Link href={product.href} className="consultationItemImage">
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={64}
          height={80}
        />
      </Link>
      <div className="consultationItemInfo">
        <h2>
          <Link href={product.href}>{product.name}</Link>
        </h2>
        <p>Código: {product.sku}</p>
        <p>
          {product.stock == null
            ? "Stock a confirmar"
            : `${product.stock} disponibles`}
        </p>
        {quantity > limit && (
          <p role="alert">
            El stock cambió. Reducí la cantidad o quitá este artículo.
          </p>
        )}
        <span>
          {product.price === null
            ? "Consultar precio"
            : `${product.priceFrom ? "Desde " : ""}${formatAmount(product.price)}`}
        </span>
      </div>
      <div className="consultationItemActions">
        <label htmlFor={id} className="consultationItemLabel">
          Cantidad de {product.name}
        </label>
        <input
          id={id}
          type="number"
          min={1}
          max={limit}
          step={1}
          required
          value={draft ?? quantity}
          onChange={(event) => {
            const value = event.target.value;
            setDraft(value);
            const amount = Number(value);
            if (Number.isInteger(amount) && amount >= 1 && amount <= limit)
              onQuantityChange(amount);
          }}
          onBlur={() => setDraft(null)}
        />
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Quitar ${product.name}`}
        >
          Quitar
        </button>
      </div>
    </article>
  );
}
