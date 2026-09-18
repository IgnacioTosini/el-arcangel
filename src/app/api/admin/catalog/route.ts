import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';

import { AdminValidationError, writableFields } from '@/lib/admin-database';
import { isAdminAuthenticated } from '@/lib/admin-session';
import { requireCategoryCanBeRemoved, requirePublishedProductCategory } from '@/lib/catalog-categories';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slug';
import { resolveVariantSku } from '@/lib/variant-sku';

import type { AdminRecord } from '@/components/admin/adminModels';

function record(value: unknown): AdminRecord {
    if (!value || typeof value !== 'object' || Array.isArray(value) || typeof (value as AdminRecord).id !== 'string') throw new AdminValidationError('Datos inválidos.');
    return value as AdminRecord;
}

function rows(value: unknown): AdminRecord[] {
    if (!Array.isArray(value) || value.length > 200) throw new AdminValidationError('Lista de variantes o imágenes inválida.');
    const result = value.map(record);
    if (new Set(result.map(item => item.id)).size !== result.length) throw new AdminValidationError('Hay registros repetidos.');
    return result;
}

function existingWhere(draft: AdminRecord) {
    if (!draft.updatedAt || !Number.isFinite(new Date(String(draft.updatedAt)).getTime())) throw new AdminValidationError('Actualizá el panel antes de editar este registro.');
    return { id: draft.id, updatedAt: new Date(String(draft.updatedAt)) };
}

export async function POST(req: NextRequest) {
    if (!await isAdminAuthenticated()) return Response.json({ error: 'La sesión venció. Volvé a ingresar.' }, { status: 401 });
    if (req.headers.get('origin') !== req.nextUrl.origin) return Response.json({ error: 'Origen no permitido.' }, { status: 403 });
    try {
        const body = await req.json();
        if (!['Product', 'Category'].includes(body.model)) throw new AdminValidationError('Modelo inválido.');
        const draft = record(body.record);
        const isNew = draft.id.startsWith('draft-');
        if (!draft.slug) draft.slug = slugify(String(draft.name ?? ''));
        if (!String(draft.name ?? '').trim() || !draft.slug) throw new AdminValidationError('Completá el nombre y el slug.');
        const result = await prisma.$transaction(async tx => {
            if (body.model === 'Category') {
                const previous = isNew ? null : await tx.category.findUniqueOrThrow({ where: { id: draft.id } });
                const data = writableFields('Category', draft) as Prisma.CategoryCreateInput;
                if (!isNew && data.active === false) await requireCategoryCanBeRemoved(tx, draft.id);
                const saved = isNew ? await tx.category.create({ data }) : await tx.category.update({ where: existingWhere(draft), data });
                const cleanup = previous?.imageUrl?.startsWith('https://res.cloudinary.com/') && previous.publicId && previous.publicId !== saved.publicId ? [previous.publicId] : [];
                return { id: saved.id, cleanup };
            }

            const variants = rows(body.variants);
            const images = rows(body.images);
            const previous = isNew ? null : await tx.product.findUniqueOrThrow({ where: { id: draft.id }, include: { variants: true, images: true } });
            const data = writableFields('Product', draft);
            if (isNew && data.categories) data.categories = { connect: (data.categories as { set: { id: string }[] }).set };
            const saved = isNew ? await tx.product.create({ data: data as Prisma.ProductCreateInput }) : await tx.product.update({ where: existingWhere(draft), data: data as Prisma.ProductUpdateInput });
            await requirePublishedProductCategory(tx, saved.id);

            const reservedSkus = new Set(variants.map(variant => typeof variant.sku === 'string' ? variant.sku.trim() : '').filter(Boolean));
            for (const [sortOrder, variant] of variants.entries()) {
                const sku = await resolveVariantSku(tx, variant.sku, previous?.variants.find(item => item.id === variant.id)?.sku, reservedSkus);
                reservedSkus.add(sku);
                const fields = writableFields('ProductVariant', { ...variant, sku });
                fields.sortOrder = sortOrder;
                delete fields.productId;
                if (variant.id.startsWith('draft-')) await tx.productVariant.create({ data: { ...fields, productId: saved.id } as Prisma.ProductVariantUncheckedCreateInput });
                else {
                    if (!previous?.variants.some(item => item.id === variant.id)) throw new AdminValidationError('La variante no pertenece a este producto.');
                    await tx.productVariant.update({ where: { id: variant.id }, data: fields });
                }
            }
            const removedVariants = previous?.variants.filter(item => !variants.some(variant => variant.id === item.id)).map(item => item.id) ?? [];
            await tx.productVariant.deleteMany({ where: { id: { in: removedVariants }, productId: saved.id } });

            for (const [sortOrder, image] of images.entries()) {
                const fields = writableFields('ProductImage', image);
                delete fields.productId;
                if (image.id.startsWith('draft-')) await tx.productImage.create({ data: { ...fields, sortOrder, productId: saved.id } as Prisma.ProductImageUncheckedCreateInput });
                else {
                    if (!previous?.images.some(item => item.id === image.id)) throw new AdminValidationError('La imagen no pertenece a este producto.');
                    await tx.productImage.update({ where: { id: image.id }, data: { ...fields, sortOrder } });
                }
            }
            const removedImages = previous?.images.filter(item => !images.some(image => image.id === item.id)).map(item => item.id) ?? [];
            await tx.productImage.deleteMany({ where: { id: { in: removedImages }, productId: saved.id } });
            const cleanup = previous?.images.filter(item => item.url.startsWith('https://res.cloudinary.com/') && !images.some(image => image.publicId === item.publicId)).map(item => item.publicId) ?? [];
            return { id: saved.id, cleanup };
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
        return Response.json(result);
    } catch (error) {
        if (error instanceof AdminValidationError) return Response.json({ error: error.message }, { status: 400 });
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') return Response.json({ error: 'El registro cambió o fue eliminado. Cancelá el borrador y actualizá los datos antes de reintentar.' }, { status: 409 });
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return Response.json({ error: 'Ese slug o código SKU ya está en uso. Revisalo antes de guardar.' }, { status: 400 });
        return Response.json({ error: 'No se guardaron los cambios. Revisá los campos y la conexión.' }, { status: 400 });
    }
}
