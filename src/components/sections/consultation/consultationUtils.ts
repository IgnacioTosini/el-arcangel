import type { CatalogProduct } from '@/data/products';

export type ConsultationLine = { product: CatalogProduct; quantity: number };
export type CustomerDetails = { name: string; phone: string; business: string; comment: string };
export const formatAmount = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount);

export function getEstimate(lines: ConsultationLine[]) {
    return {
        amount: lines.reduce((total, line) => total + (line.product.price ?? 0) * line.quantity, 0),
        incomplete: lines.some((line) => line.product.price === null),
    };
}

export function buildMessage(lines: ConsultationLine[], type: 'RETAIL' | 'WHOLESALE', customer: CustomerDetails) {
    return [
        `Hola El Arcángel, quiero consultar precios por ${type === 'WHOLESALE' ? 'mayor' : 'menor'}:`,
        customer.name.trim() ? `Mi nombre: ${customer.name.trim()}` : '',
        type === 'WHOLESALE' && customer.business.trim() ? `Negocio: ${customer.business.trim()}` : '',
        '',
        ...lines.map(({ product, quantity }) => `• ${quantity} x ${product.name} (${product.sku}) — ${product.price === null ? 'Precio a confirmar' : `${product.priceFrom ? 'Desde ' : ''}${formatAmount(product.price)} por unidad`}`),
        '',
        customer.comment.trim() ? `Comentario: ${customer.comment.trim()}` : '',
        'Precios y disponibilidad a confirmar.',
        'Enviado desde el catálogo web.',
    ].filter((line, index, all) => line !== '' || (index > 0 && all[index - 1] !== '')).join('\n');
}
