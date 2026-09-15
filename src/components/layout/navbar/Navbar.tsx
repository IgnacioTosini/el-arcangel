'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { useConsultation } from '@/components/providers/ConsultationProvider';
import './_navbar.scss';

type NavbarProps = {
    consultationCount?: number;
};

export default function Navbar({ consultationCount }: NavbarProps) {
    const { count } = useConsultation();
    const itemCount = consultationCount ?? count;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuButtonRef = useRef<HTMLButtonElement>(null);

    function closeMenu() {
        setIsMenuOpen(false);
    }

    return (
        <header className="navbarContent" onKeyDown={(event) => {
            if (event.key === 'Escape' && isMenuOpen) {
                closeMenu();
                menuButtonRef.current?.focus();
            }
        }}>
            <div className="navbarInner">
                <Link href="/" className="navbarBrand" onClick={closeMenu} aria-label="El Arcángel, inicio">
                    EL ARCÁNGEL
                </Link>

                <div id="navbarMenu" className={`navbarMenu${isMenuOpen ? ' navbarMenuOpen' : ''}`}>
                    <nav className="navbarLinks" aria-label="Navegación principal">
                        <Link href="/catalogo" className="navbarLink" onClick={closeMenu}>Catálogo</Link>
                        <Link href="/mayoristas" className="navbarLink" onClick={closeMenu}>Mayoristas</Link>
                        <Link href="/contacto" className="navbarLink" onClick={closeMenu}>El local</Link>
                    </nav>
                    <form className="navbarSearch" action="/catalogo" method="get" role="search" onSubmit={closeMenu}>
                        <input
                            className="navbarSearchInput"
                            type="search"
                            name="q"
                            aria-label="Buscar por nombre o código"
                            placeholder="Buscar por nombre o código…"
                        />
                    </form>
                </div>

                <Link href="/mi-consulta" className="navbarConsultation" onClick={closeMenu}>
                    <span>Mi consulta</span>
                    <span className="navbarCount" aria-label={`${itemCount} artículos`}>
                        {itemCount}
                    </span>
                </Link>
                <button
                    ref={menuButtonRef}
                    className="navbarMenuButton"
                    type="button"
                    aria-expanded={isMenuOpen}
                    aria-controls="navbarMenu"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    Menú
                </button>
            </div>
        </header>
    );
}
