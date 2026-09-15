import { pageMetadata } from '@/lib/seo';
import Local from '@/components/sections/local/Local';

export const metadata = pageMetadata('El local | El Arcángel', 'Conocé El Arcángel, santería y regalería con venta por mayor y menor. Información de contacto y consultas.', '/contacto');

export default function ContactPage() {
    return <main><Local /></main>;
}
