export function openWhatsApp(phone: string, message: string) {
    window.location.assign(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`);
}
