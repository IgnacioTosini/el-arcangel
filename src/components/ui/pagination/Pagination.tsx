"use client";
import "./_pagination.scss";

export default function Pagination({
  page,
  total,
  pageSize,
  onChange,
  targetId,
  showSinglePage = false,
}: {
  page: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void | boolean;
  targetId: string;
  showSinglePage?: boolean;
}) {
  const pages = Math.ceil(total / pageSize);
  if (total === 0 || (pages <= 1 && !showSinglePage)) return null;
  const numbers = Array.from(
    new Set([
      1,
      ...Array.from({ length: 3 }, (_, index) => page + index - 1),
      pages,
    ]),
  )
    .filter((value) => value >= 1 && value <= pages)
    .sort((a, b) => a - b);
  function change(next: number) {
    if (next === page || onChange(next) === false) return;
    document
      .getElementById(targetId)
      ?.scrollIntoView({ block: "start", behavior: "instant" });
  }
  return (
    <nav className="pagination" aria-label="Paginación">
      <p aria-live="polite">
        Mostrando {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}{" "}
        de {total}
      </p>
      <div className="paginationButtons">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => change(page - 1)}
          aria-label="Página anterior"
        >
          Anterior
        </button>
        {numbers.map((number, index) => (
          <span key={number}>
            {index > 0 && number - numbers[index - 1] > 1 && (
              <span className="paginationGap" aria-hidden="true">
                …
              </span>
            )}
            <button
              type="button"
              aria-label={`Página ${number}`}
              aria-current={page === number ? "page" : undefined}
              onClick={() => change(number)}
            >
              {number}
            </button>
          </span>
        ))}
        <button
          type="button"
          disabled={page === pages}
          onClick={() => change(page + 1)}
          aria-label="Página siguiente"
        >
          Siguiente
        </button>
      </div>
    </nav>
  );
}
