'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAdmin } from '../AdminProvider';
import DeleteRecordButton from '../DeleteRecordButton';
import type { AdminRecord } from '../adminModels';
import CatalogForm from '../catalogForm/CatalogForm';
import { isDisplayableImage, sortProductImages } from '@/lib/product-images';
import './_productEditor.scss';

export default function ProductEditor({ product, initiallyOpen = false, onClose }: { product: AdminRecord; initiallyOpen?: boolean; onClose?: () => void }) {
    const { data, remove } = useAdmin();
    const [open, setOpen] = useState(initiallyOpen);
    const images = sortProductImages(data.ProductImage.filter(item => item.productId === product.id));
    const isNew = product.id.startsWith('draft-');
    return <article className="productEditorContent">
        <div className="productEditorHeader">
            {isDisplayableImage(images[0]?.url) && <Image src={images[0].url} alt="" width={48} height={48} className="productEditorThumbnail" />}
            <div className="productEditorSummary"><strong>{isNew ? 'Nuevo producto' : product.name}</strong><p>{isNew ? 'Todavía no se guardó' : product.active ? 'Visible en el sitio' : 'Oculto en el sitio'}</p></div>
            {!open && <div className="adminRecordActions"><button type="button" className="adminButton" onClick={() => setOpen(true)}>Editar</button>
                {!isNew && <DeleteRecordButton label="Eliminar producto" recordName={String(product.name)} description="Se quitará del catálogo junto con sus variantes e imágenes." onDelete={() => remove('Product', product.id)} />}
            </div>}
        </div>
        {open && <div className="productEditorBody"><CatalogForm model="Product" initial={product} onClose={() => { setOpen(false); onClose?.(); }} /></div>}
    </article>;
}
