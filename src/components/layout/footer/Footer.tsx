import Link from 'next/link';
import './_footer.scss';

export default function Footer() {
    return (
        <footer className="footerContent">
            <div className="footerInner">
                <div className="footerBrand">
                    <Link href="/" className="footerBrandLink" aria-label="El Arcángel, inicio">EL ARCÁNGEL</Link>
                    <p className="footerDescription">Santería y regalería. Venta por mayor y menor.</p>
                </div>
                <nav className="footerSections" aria-labelledby="footerSectionsTitle">
                    <h2 id="footerSectionsTitle" className="footerTitle">Secciones</h2>
                    <ul className="footerLinks">
                        <li><Link href="/catalogo">Catálogo</Link></li>
                        <li><Link href="/mayoristas">Mayoristas</Link></li>
                        <li><Link href="/contacto">El local</Link></li>
                        <li><Link href="/mi-consulta">Mi consulta</Link></li>
                    </ul>
                </nav>
                <div className="footerContact">
                    <h2 className="footerTitle">Contacto</h2>
                    <a
                        href="https://www.instagram.com/elarcangelelarcangel/"
                        className="footerInstagram"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Instagram @elarcangelelarcangel
                    </a>
                    <p className="footerDescription">Dirección, teléfono y horarios: a confirmar con el comercio.</p>
                </div>
            </div>
            <div className="footerBottom">
                <small>Creado por Ignacio Tosini · {new Date().getFullYear()}</small>
            </div>
        </footer>
    );
}
