import type { Metadata } from "next";
import { pageMetadata, siteUrl } from '@/lib/seo';
import { Karla, Cormorant_Garamond } from "next/font/google";
import SiteFrame from "@/components/layout/SiteFrame";
import ConsultationProvider from "@/components/providers/ConsultationProvider";
import SiteSettingsProvider from "@/components/providers/SiteSettingsProvider";
import "./globals.scss";
import { ToastProvider } from '@/components/providers/ToastProvider';

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  ...pageMetadata('El Arcángel | Santería y regalería', 'Santería y regalería con venta por mayor y menor. Descubrí el catálogo de El Arcángel.', '/'),
  metadataBase: new URL(siteUrl ?? 'http://localhost:3000'),
  title: 'El Arcángel | Santería y regalería',
  description: 'Santería y regalería con venta por mayor y menor. Descubrí sahumerios, imágenes religiosas y regalos en El Arcángel.',
  applicationName: 'El Arcángel',
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${karla.variable} ${cormorantGaramond.variable}`}>
      <body>
        <ToastProvider />
        <ConsultationProvider>
          <SiteSettingsProvider><SiteFrame>{children}</SiteFrame></SiteSettingsProvider>
        </ConsultationProvider>
      </body>
    </html>
  );
}
