'use client';

import { useRef, useState } from 'react';
import { useSiteSettings } from '@/components/providers/SiteSettingsProvider';
import { useConsultation } from '@/components/providers/ConsultationProvider';
import { openWhatsApp } from '@/lib/open-whatsapp';
import './_messagePreview.scss';

export default function MessagePreview({ message, onSubmit, blocked = false }: { message: string; onSubmit: () => Promise<string>; blocked?: boolean }) {
    const { settings } = useSiteSettings();
    const whatsappReady = /^\d{8,15}$/.test(settings.whatsapp);
    const [saving, setSaving] = useState(false);
    const busy = useRef(false);
    const { clearItems } = useConsultation();
    async function sendInquiry() {
        if (busy.current || !whatsappReady || blocked) return;
        busy.current = true;
        setSaving(true);
        try {
            await openWhatsApp(settings.whatsapp, message, onSubmit);
            clearItems();
        }
        catch (error) { setStatus(error instanceof Error ? error.message : 'No se pudo enviar.'); }
        finally { busy.current = false; setSaving(false); }
    }
    const [status, setStatus] = useState('');
    const messageRef = useRef<HTMLPreElement>(null);
    async function copyMessage() {
        try {
            await navigator.clipboard.writeText(message);
            setStatus('Mensaje copiado.');
        } catch {
            const selection = window.getSelection();
            const range = document.createRange();
            if (messageRef.current && selection) {
                range.selectNodeContents(messageRef.current);
                selection.removeAllRanges();
                selection.addRange(range);
            }
            setStatus('No pudimos copiar automáticamente. Seleccioná el mensaje y copialo manualmente.');
        }
    }
    return (
        <section className="messagePreviewContent" aria-label="Mensaje a enviar">
            <h2>Mensaje a enviar</h2>
            <pre ref={messageRef} tabIndex={0}>{message}</pre>
            <p className="messagePreviewNote">Completá tu nombre y teléfono. Al continuar, guardamos tu consulta para que el local pueda responderte y vaciamos tu lista. WhatsApp se abrirá en una nueva pestaña con el mensaje preparado: presioná Enviar allí para terminar.</p>
            <div className="messagePreviewButtons"><button type="button" className="consultationButton consultationButtonPrimary" disabled={saving || !whatsappReady || blocked} onClick={sendInquiry}>{saving ? 'Preparando consulta…' : 'Continuar por WhatsApp'}</button>
                <button type="button" className="consultationButton" onClick={copyMessage}>Copiar mensaje</button>
            </div>
            {!whatsappReady && <p className="messagePreviewNote">Todavía no tenemos el número de WhatsApp confirmado del local. Podés copiar el mensaje{settings.instagram && <> y enviarlo por <a href={settings.instagram} target="_blank" rel="noopener noreferrer">Instagram</a></>}.</p>}
            <p role="status" className="messagePreviewStatus">{status}</p>
        </section>
    );
}
