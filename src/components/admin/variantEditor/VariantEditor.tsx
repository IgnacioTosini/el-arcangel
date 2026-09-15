import InlineFields from '../inlineFields/InlineFields';
import { useAdmin } from '../AdminProvider';
import DeleteRecordButton from '../DeleteRecordButton';
import type { AdminRecord } from '../adminModels';
import './_variantEditor.scss';

export default function VariantEditor({ variant }: { variant: AdminRecord }) {
    const { save, remove } = useAdmin();
    return <section className="variantEditorContent" aria-label={`Variante ${variant.name}`}>
        <InlineFields record={variant} onSave={record => save('ProductVariant', record)} fields={[
            { name:'name', label:'Nombre de la variante' }, { name:'sku', label:'Código (SKU)' },
            { name:'stock', label:'Stock (vacío = a confirmar)', type:'number', optional:true }, { name:'price', label:'Precio de referencia ($)', type:'number', optional:true, step:'0.01', placeholder:'A consultar' },
            { name:'compareAtPrice', label:'Precio anterior ($)', type:'number', optional:true, step:'0.01' }, { name:'aroma', label:'Aroma', optional:true },
            { name:'color', label:'Color', optional:true }, { name:'size', label:'Tamaño', optional:true }, { name:'presentation', label:'Presentación', optional:true },
            { name:'sortOrder', label:'Orden', type:'number' }, { name:'active', label:'Variante a la venta', type:'checkbox' },
        ]} />
        <div className="adminCardActions"><DeleteRecordButton label="Eliminar variante" onDelete={() => remove('ProductVariant', variant.id)} /></div>
    </section>;
}
