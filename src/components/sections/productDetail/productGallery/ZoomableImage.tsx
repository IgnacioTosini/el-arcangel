'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export default function ZoomableImage({ imageUrl, name }: { imageUrl: string; name: string }) {
    const viewportRef = useRef<HTMLDivElement>(null);
    const touchRef = useRef<{ x: number; y: number } | null>(null);
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 50, y: 50 });

    useEffect(() => {
        const viewport = viewportRef.current!;
        function handleWheel(event: WheelEvent) {
            event.preventDefault();
            const bounds = viewport.getBoundingClientRect();
            setPosition({ x: clamp((event.clientX - bounds.left) / bounds.width * 100, 0, 100), y: clamp((event.clientY - bounds.top) / bounds.height * 100, 0, 100) });
            const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? bounds.height : 1);
            setZoom((current) => clamp(current * Math.exp(-delta * 0.002), 1, 4));
        }
        viewport.addEventListener('wheel', handleWheel, { passive: false });
        return () => viewport.removeEventListener('wheel', handleWheel);
    }, []);

    function reset() {
        setZoom(1);
        setPosition({ x: 50, y: 50 });
    }

    return (
        <>
            <div className="productGalleryControls">
                <button type="button" onClick={() => setZoom((current) => clamp(current - 0.5, 1, 4))} disabled={zoom === 1} aria-label="Reducir imagen">−</button>
                <span>{Math.round(zoom * 100)}%</span>
                <button type="button" onClick={() => setZoom((current) => clamp(current + 0.5, 1, 4))} disabled={zoom === 4} aria-label="Ampliar imagen">+</button>
                <button type="button" onClick={reset}>Ajustar a pantalla</button>
                <p>Ruedita para ampliar · Mové el mouse para explorar</p>
            </div>
            <div ref={viewportRef} className="productGalleryViewport" tabIndex={0} role="region" aria-label="Imagen ampliable. Usá más y menos para zoom, flechas para explorar y cero para restablecer."
                onPointerMove={(event) => {
                    const bounds = event.currentTarget.getBoundingClientRect();
                    if (event.pointerType === 'mouse') {
                        setPosition({ x: clamp((event.clientX - bounds.left) / bounds.width * 100, 0, 100), y: clamp((event.clientY - bounds.top) / bounds.height * 100, 0, 100) });
                    } else if (touchRef.current && zoom > 1) {
                        const deltaX = (event.clientX - touchRef.current.x) / bounds.width * 100;
                        const deltaY = (event.clientY - touchRef.current.y) / bounds.height * 100;
                        setPosition((current) => ({ x: clamp(current.x - deltaX, 0, 100), y: clamp(current.y - deltaY, 0, 100) }));
                        touchRef.current = { x: event.clientX, y: event.clientY };
                    }
                }}
                onPointerDown={(event) => {
                    if (event.pointerType !== 'mouse') {
                        touchRef.current = { x: event.clientX, y: event.clientY };
                        event.currentTarget.setPointerCapture(event.pointerId);
                    }
                }}
                onPointerUp={() => { touchRef.current = null; }}
                onPointerCancel={() => { touchRef.current = null; }}
                onKeyDown={(event) => {
                    if (!['+', '=', '-', '0', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
                    event.preventDefault();
                    if (event.key === '0') reset();
                    else if (event.key === '+' || event.key === '=') setZoom((current) => clamp(current + 0.5, 1, 4));
                    else if (event.key === '-') setZoom((current) => clamp(current - 0.5, 1, 4));
                    else setPosition((current) => ({ x: clamp(current.x + (event.key === 'ArrowRight' ? 10 : event.key === 'ArrowLeft' ? -10 : 0), 0, 100), y: clamp(current.y + (event.key === 'ArrowDown' ? 10 : event.key === 'ArrowUp' ? -10 : 0), 0, 100) }));
                }}>
                <Image src={imageUrl} alt={name} width={640} height={800} draggable={false} className="productGalleryExpanded" sizes="(max-width: 700px) 150vw, 1200px" style={{ transform: `scale(${zoom})`, transformOrigin: `${position.x}% ${position.y}%` }} />
            </div>
        </>
    );
}
