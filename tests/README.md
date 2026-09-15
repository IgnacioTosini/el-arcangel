Las pruebas usan Vitest y TypeScript. Los componentes se prueban con React Testing Library, user-event y jsdom.

- `npm test`: ejecuta las pruebas unitarias y de componentes una vez. No necesita Next.js, PostgreSQL ni credenciales y no llama a Cloudinary.
- `npm run test:watch`: vuelve a ejecutar las pruebas al modificar archivos.
- `npm run test:integration`: ejecuta únicamente las pruebas contra Next.js y PostgreSQL locales.

Para las pruebas de integración, iniciá Docker Desktop, ejecutá `docker compose up -d` y dejá `npm run dev` funcionando en otra terminal. La base debe tener las migraciones aplicadas (`npx prisma migrate deploy`). Las pruebas leen `DATABASE_URL` y `ADMIN_PASSWORD` desde `.env`, igual que el servidor. El destino predeterminado es `http://localhost:3000`; `TEST_BASE_URL` permite usar otro puerto local.

Las pruebas de integración crean registros temporales y eliminan los registros que crearon. No hacen uploads ni borrados en Cloudinary. Usan la base local configurada; la numeración de consultas puede avanzar. Las pruebas rápidas y de integración se ejecutan por separado para evitar escribir en la base durante el trabajo habitual.

Cobertura de comportamiento: sesiones administrativas; slugs; validación y optimización de imágenes; orden entre guardado y eliminación; Guardar/Cancelar y errores de formularios; búsqueda de categorías; ABM y publicación; consultas e idempotencia; guardado conjunto y rollback de productos.

`check-db.cjs` sigue siendo un diagnóstico manual de conexión, no forma parte de la suite.
