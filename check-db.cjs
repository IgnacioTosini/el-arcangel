/* Diagnóstico manual: no crea, modifica ni elimina registros. */
require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
async function main() {
    try {
        if (!process.env.DATABASE_URL) throw new Error('missing');
        console.log('Conexión correcta. Productos:', await db.product.count());
    } catch (error) {
        console.error('No se pudo consultar PostgreSQL. Revisá Docker, DATABASE_URL y las migraciones. Código:', error.code || error.errorCode || error.name);
        process.exitCode = 1;
    } finally { await db.$disconnect(); }
}
void main();
