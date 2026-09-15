import { useId } from 'react';
import type { CustomerDetails } from '../consultationUtils';
import './_customerForm.scss';

type CustomerFormProps = { value: CustomerDetails; wholesale: boolean; onChange: (value: CustomerDetails) => void };

export default function CustomerForm({ value, wholesale, onChange }: CustomerFormProps) {
    const id = useId();
    return (
        <div className="customerFormContent" role="group" aria-label="Datos de la consulta">
            <label htmlFor={`${id}-name`}>Tu nombre</label>
            <input id={`${id}-name`} autoComplete="name" maxLength={120} placeholder="Nombre y apellido" value={value.name} onChange={(event) => onChange({ ...value, name: event.target.value })} />
            <label htmlFor={`${id}-phone`}>Teléfono de contacto</label>
            <input id={`${id}-phone`} type="tel" autoComplete="tel" maxLength={30} placeholder="Número con código de área" value={value.phone} onChange={event => onChange({ ...value, phone: event.target.value })} />
            {wholesale && <>
                <label htmlFor={`${id}-business`}>Nombre del negocio (opcional)</label>
                <input id={`${id}-business`} autoComplete="organization" maxLength={160} placeholder="Comercio o emprendimiento" value={value.business} onChange={(event) => onChange({ ...value, business: event.target.value })} />
            </>}
            <label htmlFor={`${id}-comment`}>Comentario (opcional)</label>
            <textarea id={`${id}-comment`} rows={4} maxLength={2000} placeholder="Aromas preferidos, fecha en que lo necesitás, etc." value={value.comment} onChange={(event) => onChange({ ...value, comment: event.target.value })} />
        </div>
    );
}
