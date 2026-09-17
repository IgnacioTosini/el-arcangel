'use client';

import Link from 'next/link';
import ProductSearch from '@/components/ui/productSearch/ProductSearch';
import { useRef, useState } from 'react';
import { useConsultation } from '@/components/providers/ConsultationProvider';
import './_navbar.scss';

type NavbarProps = {
    consultationCount?: number;
    hasWholesaleSession?: boolean;
};

export default function Navbar({ consultationCount, hasWholesaleSession = false }: NavbarProps) {
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
                    <span>EL</span>{' '}<span>ARCÁNGEL</span>
                </Link>

                <div id="navbarMenu" className={`navbarMenu${isMenuOpen ? ' navbarMenuOpen' : ''}`}>
                    <nav className="navbarLinks" aria-label="Navegación principal">
                        <Link href="/catalogo" className="navbarLink" onClick={closeMenu}>Catálogo</Link>
                        <Link href="/mayoristas" className="navbarLink" onClick={closeMenu}>Mayoristas</Link>
                        <Link href="/contacto" className="navbarLink" onClick={closeMenu}>El local</Link>
                    </nav>
                    <div className="navbarSearch"><ProductSearch onNavigate={closeMenu} /></div>
                </div>

                <Link href="/mayoristas/cuenta" className="navbarAccount" onClick={closeMenu} aria-label={hasWholesaleSession ? 'Mi cuenta mayorista' : 'Acceso mayorista'} title={hasWholesaleSession ? 'Mi cuenta mayorista' : 'Acceso mayorista'}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" /></svg>
                    <span>{hasWholesaleSession ? 'Mi cuenta' : 'Acceso mayorista'}</span>
                </Link>
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
