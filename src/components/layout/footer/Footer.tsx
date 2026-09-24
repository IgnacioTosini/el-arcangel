"use client";
import Link from "next/link";

import { useSiteSettings } from "@/components/providers/SiteSettingsProvider";
import { readHomeContent } from "@/lib/home-content";
import { useAnimation } from "@/lib/use-animation";

import { animateFooter } from "./footer.animation";

import "./_footer.scss";

export default function Footer() {
  const animationRef = useAnimation<HTMLElement>(animateFooter);
  const { settings } = useSiteSettings();
  return (
    <footer ref={animationRef} className="footerContent">
      <div className="footerInner">
        <div className="footerBrand">
          <Link
            href="/"
            className="footerBrandLink"
            aria-label={`${settings.name}, inicio`}
          >
            {settings.name.toLocaleUpperCase("es")}
          </Link>
          <p className="footerDescription">
            {readHomeContent(settings.homeContent).footerDescription}
          </p>
        </div>
        <nav className="footerSections" aria-labelledby="footerSectionsTitle">
          <h2 id="footerSectionsTitle" className="footerTitle">
            Secciones
          </h2>
          <ul className="footerLinks">
            <li>
              <Link href="/catalogo">Catálogo</Link>
            </li>
            <li>
              <Link href="/mayoristas">Mayoristas</Link>
            </li>
            <li>
              <Link href="/contacto">El local</Link>
            </li>
            <li>
              <Link href="/mi-consulta">Mi consulta</Link>
            </li>
          </ul>
        </nav>
        <div className="footerContact">
          <h2 className="footerTitle">Contacto</h2>
          {settings.instagram && (
            <a
              href={settings.instagram}
              className="footerInstagram"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
          )}
          {settings.whatsapp && (
            <p className="footerDescription">
              <a
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp +{settings.whatsapp}
              </a>
            </p>
          )}
          {settings.address && (
            <p className="footerDescription">{settings.address}</p>
          )}
          {settings.hours && (
            <p className="footerDescription">{settings.hours}</p>
          )}
        </div>
      </div>
      <div className="footerBottom">
        <small>Creado por Ignacio Tosini · {new Date().getFullYear()}</small>
      </div>
    </footer>
  );
}
