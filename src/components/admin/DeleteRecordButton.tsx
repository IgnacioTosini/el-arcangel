'use client';

import { useId, useRef, useState } from 'react';

import Modal from '@/components/ui/modal/Modal';

import './_deleteRecordButton.scss';

export default function DeleteRecordButton({ label, recordName, description = 'El registro se quitará del sitio.', onDelete }: { label: string; recordName?: string; description?: string; onDelete: () => Promise<string | null> }) {
    const [confirm, setConfirm] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const cancelRef = useRef<HTMLButtonElement>(null);
    const lock = useRef(false);
    const descriptionId = useId();
    async function remove() {
        if (lock.current) return;
        lock.current = true; setBusy(true); setError('');
        try {
            const failure = await onDelete();
            if (failure) setError(failure);
            else setConfirm(false);
        } catch { setError('No se pudo eliminar. Intentá nuevamente.'); }
        finally { lock.current = false; setBusy(false); }
    }
    return <>
        <button type="button" className="deleteRecordTrigger" aria-label={recordName ? `${label}: ${recordName}` : label} aria-haspopup="dialog" onClick={() => { setError(''); setConfirm(true); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" /></svg>
            Eliminar
        </button>
        {confirm && <Modal title={label} onClose={() => { if (!lock.current) setConfirm(false); }} dismissible={!busy} initialFocusRef={cancelRef} descriptionId={descriptionId}>
            <div className="deleteRecordConfirmation" aria-busy={busy}>
                {recordName && <p className="deleteRecordName">{recordName}</p>}
                <p id={descriptionId}>{description} Esta acción no se puede deshacer.</p>
                {error && <p className="deleteRecordError" role="alert">{error}</p>}
                {busy && <p role="status">Eliminando, esperá un momento…</p>}
                <div className="deleteRecordActions">
                    <button ref={cancelRef} type="button" className="adminButton" disabled={busy} onClick={() => setConfirm(false)}>Cancelar</button>
                    <button type="button" className="deleteRecordConfirm" disabled={busy} onClick={() => void remove()}>{busy ? 'Eliminando…' : 'Sí, eliminar'}</button>
                </div>
            </div>
        </Modal>}
    </>;
}
