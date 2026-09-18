export function customerDetailsError(customer: { name: string; phone: string }): string | null {
    if (!customer.name.trim() || customer.name.length > 120) return 'Completá tu nombre para continuar.';
    if (!/^[+\d ()-]{8,30}$/.test(customer.phone) || customer.phone.replace(/\D/g, '').length < 8) return 'Completá un teléfono de contacto válido, con código de área.';
    return null;
}
