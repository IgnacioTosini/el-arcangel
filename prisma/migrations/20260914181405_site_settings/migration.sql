-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'store',
    "name" TEXT NOT NULL DEFAULT 'El Arc?ngel',
    "whatsapp" TEXT NOT NULL DEFAULT '',
    "instagram" TEXT NOT NULL DEFAULT 'https://www.instagram.com/elarcangelelarcangel/',
    "address" TEXT NOT NULL DEFAULT '',
    "hours" TEXT NOT NULL DEFAULT '',
    "wholesaleText" TEXT NOT NULL DEFAULT 'Venta por mayor y menor. Las condiciones mayoristas (cantidades, precios y entregas) se confirman por consulta.',

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);
