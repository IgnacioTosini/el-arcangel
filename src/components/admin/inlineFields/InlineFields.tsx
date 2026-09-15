'use client';

import { useId, useState } from 'react';
import type { AdminRecord } from '../adminModels';
import './_inlineFields.scss';

export type InlineField = { name: string; label: string; type?: 'text' | 'number' | 'checkbox' | 'textarea'; optional?: boolean; step?: string; full?: boolean; placeholder?: string };
type InlineFieldsProps = { record: AdminRecord; fields: InlineField[]; onSave: (record: AdminRecord) => string | null | Promise<string | null> };

export default function InlineFields({ record, fields, onSave }: InlineFieldsProps) {
    const id = useId();
    const [pending, setPending] = useState<Record<string, string>>({});
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    async function saveValue(name: string, value: AdminRecord[string]) {
        setSaving(true);
        try {
            const result = await onSave({ id: record.id, [name]: value });
            setError(result ?? '');
            return result;
        } catch {
            const message = 'No se pudo guardar. Intentá nuevamente.';
            setError(message);
            return message;
        } finally { setSaving(false); }
    }
    async function commit(field: InlineField, raw: string) {
        if (!(field.name in pending)) return;
        const value = raw === '' && field.optional ? null : field.type === 'number' && raw !== '' ? Number(raw) : raw;
        if (value === record[field.name]) return;
        const result = await saveValue(field.name, value);
        if (!result) setPending(current => { const next = { ...current }; if (next[field.name] === raw) delete next[field.name]; return next; });
    }
    return <div className="inlineFieldsContent">
        {fields.map(field => <div key={field.name} className={`inlineField${field.full ? ' inlineFieldFull' : ''}${field.type === 'checkbox' ? ' inlineFieldCheck' : ''}`}>
            <label htmlFor={`${id}-${field.name}`}>{field.label}</label>
            {field.type === 'checkbox' ? <input disabled={saving} id={`${id}-${field.name}`} type="checkbox" checked={Boolean(record[field.name])} onChange={event => void saveValue(field.name, event.target.checked)} />
                : field.type === 'textarea' ? <textarea disabled={saving} id={`${id}-${field.name}`} rows={3} value={pending[field.name] ?? String(record[field.name] ?? '')} onChange={event => setPending(current => ({ ...current, [field.name]: event.target.value }))} onBlur={event => commit(field, event.target.value)} />
                : <input disabled={saving} id={`${id}-${field.name}`} type={field.type ?? 'text'} min={field.type === 'number' ? 0 : undefined} step={field.step ?? '1'} placeholder={field.placeholder} value={pending[field.name] ?? String(record[field.name] ?? '')} onChange={event => setPending(current => ({ ...current, [field.name]: event.target.value }))} onBlur={event => commit(field, event.target.value)} />}
        </div>)}
        {error && <p className="adminError inlineFieldFull" role="alert">{error}</p>}
    </div>;
}
