'use client';

import { type ReactNode, type RefObject, useEffect, useId } from 'react';

import { useAnimation } from '@/lib/use-animation';

import { animateModal } from './modal.animation';

import './_modal.scss';

type ModalProps = { title: string; onClose: () => void; children: ReactNode; variant?: 'default' | 'gallery'; dismissible?: boolean; initialFocusRef?: RefObject<HTMLElement | null>; descriptionId?: string };

export default function Modal({ title, onClose, children, variant = 'default', dismissible = true, initialFocusRef, descriptionId }: ModalProps) {
    const ref = useAnimation<HTMLDialogElement>(animateModal);
    const titleId = useId();

    useEffect(() => {
        const dialog = ref.current!;
        const previousFocus = document.activeElement as HTMLElement | null;
        const previousOverflow = document.body.style.overflow;
        dialog.showModal();
        initialFocusRef?.current?.focus();
        document.body.style.overflow = 'hidden';
        return () => {
            dialog.close();
            document.body.style.overflow = previousOverflow;
            previousFocus?.focus();
        };
    }, [initialFocusRef, ref]);

    return (
        <dialog ref={ref} className={`modalContent${variant === 'gallery' ? ' modalGallery' : ''}`} aria-labelledby={titleId} aria-describedby={descriptionId} onCancel={(event) => { event.preventDefault(); if (dismissible) onClose(); }} onClick={(event) => {
            if (dismissible && event.target === event.currentTarget) {
                const bounds = event.currentTarget.getBoundingClientRect();
                if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
            }
        }}>
            <div className="modalHeader">
                <h2 id={titleId}>{title}</h2>
                <button type="button" disabled={!dismissible} onClick={onClose} aria-label="Cerrar ventana">×</button>
            </div>
            {children}
        </dialog>
    );
}
