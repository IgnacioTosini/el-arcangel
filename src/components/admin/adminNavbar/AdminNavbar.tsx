"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { adminSections } from "../adminNavigation";
import { useAdmin } from "../AdminProvider";

import "./_adminNavbar.scss";

export default function AdminNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data } = useAdmin();
  return (
    <aside className="adminNavbarContent">
      <button
        className="adminNavbarToggle"
        type="button"
        aria-expanded={open}
        aria-controls="adminNavigation"
        onClick={() => setOpen(!open)}
      >
        Secciones del panel {open ? "−" : "+"}
      </button>
      <nav
        id="adminNavigation"
        className={`adminNavbarLinks${open ? " adminNavbarLinksOpen" : ""}`}
        aria-label="Navegación administrativa"
      >
        <Link
          href="/admin"
          aria-current={pathname === "/admin" ? "page" : undefined}
          onClick={() => setOpen(false)}
        >
          Resumen
        </Link>
        {adminSections.map((model) => (
          <Link
            key={model.name}
            href={`/admin/${model.slug}`}
            aria-current={
              pathname === `/admin/${model.slug}` ? "page" : undefined
            }
            onClick={() => setOpen(false)}
          >
            <span>{model.label}</span>
            <small>{data[model.name].length}</small>
          </Link>
        ))}
        <Link
          href="/admin/mayoristas"
          aria-current={pathname === "/admin/mayoristas" ? "page" : undefined}
          onClick={() => setOpen(false)}
        >
          Cuentas mayoristas
        </Link>
        <Link
          href="/admin/inicio"
          aria-current={pathname === "/admin/inicio" ? "page" : undefined}
          onClick={() => setOpen(false)}
        >
          Contenido del inicio
        </Link>
        <Link
          href="/admin/local"
          aria-current={pathname === "/admin/local" ? "page" : undefined}
          onClick={() => setOpen(false)}
        >
          Datos del local
        </Link>
      </nav>
    </aside>
  );
}
