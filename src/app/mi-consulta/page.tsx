import Consultation from "@/components/sections/consultation/Consultation";
import { readCustomerCatalog } from "@/lib/customer-catalog";
import { prisma } from "@/lib/prisma";

import type { Metadata } from "next";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mi consulta | El Arcángel",
  robots: { index: false, follow: true },
  description:
    "Armá tu consulta por mayor o por menor y consultanos precios y disponibilidad.",
};

export default async function ConsultationPage() {
  const { products, purchaseType, account } = await readCustomerCatalog();
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "store" },
  });
  return (
    <main>
      <Consultation
        products={products}
        purchaseType={purchaseType}
        account={account}
        wholesaleMinimumUnits={settings?.wholesaleMinimumUnits ?? 2}
        wholesaleMinimum={settings?.wholesaleMinimum.toNumber() ?? 0}
      />
    </main>
  );
}
