import { adminModels, type AdminData, type AdminRecord, type ModelName } from './adminModels';

export function validateAdminRecord(data: AdminData, model: ModelName, record: AdminRecord): string | null {
    for (const field of adminModels.find(item => item.name === model)!.fields) {
        const value = record[field.name];
        if (field.required && (value === null || value === undefined || typeof value === 'string' && !value.trim())) return `Completá el campo ${field.name}.`;
        if (value === null || value === undefined) continue;
        if (field.unique && data[model].some(item => item.id !== record.id && item[field.name] === value)) return `El valor de ${field.name} ya está en uso.`;
        if (field.options && !field.options.includes(String(value))) return 'Seleccioná una opción válida.';
        if (['Int', 'Decimal'].includes(field.type) && (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || field.type === 'Int' && !Number.isSafeInteger(value))) return 'Ingresá un número válido, sin valores negativos.';
        if (field.name === 'quantity' && Number(value) < 1) return 'La cantidad mínima es 1.';
        if (field.relation && !data[field.relation].some(item => item.id === value)) return 'El registro relacionado no existe.';
    }
    return null;
}

export function removeAdminRecord(data: AdminData, model: ModelName, id: string): AdminData {
    const next = { ...data, [model]: data[model].filter(item => item.id !== id) };
    if (model === 'Category') next.Product = data.Product.map(product => ({ ...product, categoryIds: String(product.categoryIds ?? '').split(',').filter(category => category !== id).join(',') }));
    if (model === 'Product' || model === 'ProductVariant') {
        const removed = new Set(model === 'Product' ? data.ProductVariant.filter(variant => variant.productId === id).map(variant => variant.id) : [id]);
        next.ProductVariant = data.ProductVariant.filter(variant => !removed.has(variant.id));
        next.CartItem = data.CartItem.filter(item => !removed.has(String(item.variantId)));
        next.OrderItem = data.OrderItem.map(item => removed.has(String(item.variantId)) ? { ...item, variantId: null } : item);
        if (model === 'Product') next.ProductImage = data.ProductImage.filter(image => image.productId !== id);
    }
    return next;
}

export function newAdminRecord(model: ModelName, values: Partial<AdminRecord> = {}): AdminRecord {
    const id = `demo-${crypto.randomUUID()}`;
    const timestamp = new Date().toISOString();
    const record: AdminRecord = { id };
    for (const field of adminModels.find(item => item.name === model)!.fields) {
        if (field.name === 'id') continue;
        record[field.name] = !field.required ? null : field.type === 'Boolean' ? true : ['Int','Decimal'].includes(field.type) ? 0 : field.type === 'DateTime' ? timestamp : field.options ? field.options[0] : '';
    }
    return { ...record, ...values, id } as AdminRecord;
}
