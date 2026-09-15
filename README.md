# El Arcángel

Catálogo de santería y regalería con consultas por WhatsApp y administración de productos, categorías, stock y consultas. Next.js, Prisma y PostgreSQL; imágenes en Cloudinary.

## Desarrollo local

Requisitos: Node.js 24 y Docker Desktop.

1. Copiá `.env.example` a `.env` y completá las variables. Si ya tenés una base local, conservá sus credenciales.
2. Ejecutá `npm ci`.
3. Iniciá PostgreSQL con `docker compose up -d` (puerto local 5433).
4. Ejecutá `npx prisma migrate deploy`. El cliente Prisma se genera automáticamente durante `npm ci`.
5. Ejecutá `npm run dev` y abrí `http://localhost:3000`.

El acceso al panel es `/login`, usando `ADMIN_PASSWORD`. Los productos se cargan desde el administrador. La importación opcional de ejemplos se documenta en `scripts/import-demo-catalog.mts`; no se ejecuta al instalar.

## Verificaciones

- `npm test`: pruebas unitarias y de componentes.
- `npm run lint`: revisión de código.
- `npm run build`: compila para producción.
- `npm run test:integration`: pruebas contra Next.js y PostgreSQL locales en ejecución. Crea y limpia registros temporales; ver [tests/README.md](tests/README.md).

## Despliegue

Configurá en Vercel las variables de `.env.example`, usando la conexión de Neon como `DATABASE_URL` (no `localhost`). La instalación genera el cliente Prisma. `vercel.json` configura `npm run vercel-build`, que aplica las migraciones pendientes con `prisma migrate deploy` antes de compilar. Si la migración falla, el despliegue se detiene. Las credenciales de Cloudinary son del servidor.

Las migraciones crean las tablas, pero no copian los productos de la base local. Si usás despliegues Preview, asignales una base o rama de Neon separada de Production.

La consulta no reserva stock. Al completar una venta, el servidor valida y descuenta las existencias en una transacción; requiere stock definido y suficiente. Una venta completada no puede cambiar de estado.

## SEO y dominio público

Configurá `SITE_URL` en las variables de entorno de Vercel antes de desplegar:

```env
SITE_URL=https://tu-proyecto.vercel.app
```

Reemplazá el ejemplo por la URL pública real, sin rutas adicionales. Al cambiar de dominio, actualizá la variable y volvé a desplegar. No necesita el prefijo `NEXT_PUBLIC_`.

Se usa para las URLs can?nicas, Open Graph y `/sitemap.xml`. En Vercel, si no se define `SITE_URL`, se utiliza el dominio de `VERCEL_PROJECT_PRODUCTION_URL` o `VERCEL_URL`. Fuera de Vercel, sin dominio configurado no se generan URLs can?nicas ni entradas del sitemap. El icono es la imagen social predeterminada; los productos usan su propia foto.

El favicon ICO contiene imágenes PNG **RGBA** de 16, 32, 48 y 256 píxeles. Al regenerarlo con Sharp, usar `.ensureAlpha()` antes de `.png()`; Turbopack rechaza PNG RGB dentro de un ICO.
