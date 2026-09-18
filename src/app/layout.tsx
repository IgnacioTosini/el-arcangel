import { Cormorant_Garamond, Karla } from "next/font/google";

import SiteFrame from "@/components/layout/SiteFrame";
import ConsultationProvider from "@/components/providers/ConsultationProvider";
import SiteSettingsProvider from "@/components/providers/SiteSettingsProvider";
import { ToastProvider } from '@/components/providers/ToastProvider';
import { pageMetadata, siteUrl } from '@/lib/seo';
import { getWholesaleAccount } from '@/lib/wholesale-auth';

import type { Metadata } from "next";

import "./globals.scss";

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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const account = await getWholesaleAccount();
  return (
    <html lang="es" className={`${karla.variable} ${cormorantGaramond.variable}`}>
      <body>
        <ToastProvider />
        <ConsultationProvider accountId={account?.status === 'APPROVED' ? account.id : undefined}>
          <SiteSettingsProvider><SiteFrame hasWholesaleSession={Boolean(account)}>{children}</SiteFrame></SiteSettingsProvider>
        </ConsultationProvider>
      </body>
    </html>
  );
}
