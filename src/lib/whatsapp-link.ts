export function whatsappLink(phone: string, message: string): string | null {
    const digits = phone.replace(/\D/g, '');
    const number = digits.length === 10 ? `549${digits}` : digits;
    return /^\d{8,15}$/.test(number) ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : null;
}
