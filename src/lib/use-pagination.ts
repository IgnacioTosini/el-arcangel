"use client";
import { useState } from "react";

export function usePagination<T>(
  items: T[],
  key: string,
  pageSize = 10,
  initialPage = 1,
) {
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const [state, setState] = useState({ key, page: initialPage });
  const page = Math.max(1, Math.min(state.key === key ? state.page : 1, pages));
  if (state.key !== key || state.page !== page) setState({ key, page });
  return {
    page,
    pageSize,
    total: items.length,
    items: items.slice((page - 1) * pageSize, page * pageSize),
    setPage: (next: number) => setState({ key, page: next }),
  };
}
