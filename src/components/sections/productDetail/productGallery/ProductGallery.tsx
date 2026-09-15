'use client';

import Image from 'next/image';
import { useState } from 'react';
import Modal from '@/components/ui/modal/Modal';
import ZoomableImage from './ZoomableImage';
import './_productGallery.scss';

type ProductGalleryProps = { imageUrl: string; name: string };

export default function ProductGallery({ imageUrl, name }: ProductGalleryProps) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="productGalleryContent">
            <button className="productGalleryPreview" type="button" onClick={() => setIsOpen(true)} aria-label={`Ampliar imagen de ${name}`}>
                <Image src={imageUrl} alt={name} width={640} height={800} priority sizes="(max-width: 700px) calc(100vw - 32px), (max-width: 1100px) 48vw, 510px" />
                <span>Ampliar imagen ↗</span>
            </button>
            {isOpen && (
                <Modal variant="gallery" title={name} onClose={() => setIsOpen(false)}>
                    <ZoomableImage imageUrl={imageUrl} name={name} />
                </Modal>
            )}
        </div>
    );
}
