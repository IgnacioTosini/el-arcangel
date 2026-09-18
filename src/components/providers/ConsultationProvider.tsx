'use client';

import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { notifyConsultationAdded } from '@/components/ui/consultationToast/ConsultationToast';

export type ConsultationItem = {
    id: string;
    name: string;
    quantity: number;
    stock?: number | null;
};

type ConsultationContextValue = {
    items: ConsultationItem[];
    count: number;
    updateQuantity: (id: string, quantity: number, stock?: number | null) => void;
    removeItem: (id: string) => void;
    clearItems: () => void;
    addItem: (item: Omit<ConsultationItem, 'quantity'>, quantity?: number) => void;
};

const ConsultationContext = createContext<ConsultationContextValue | null>(null);
export default function ConsultationProvider({ children, accountId }: { children: ReactNode; accountId?: string }) {
    // Keep the existing visitor list; each approved account gets its own browser storage.
    const storageKey = accountId ? `el-arcangel:consultation:wholesale:${accountId}` : 'el-arcangel:consultation:v1';
    return <ScopedConsultationProvider key={storageKey} storageKey={storageKey}>{children}</ScopedConsultationProvider>;
}

function ScopedConsultationProvider({ children, storageKey }: { children: ReactNode; storageKey: string }) {
    const [items, setItems] = useState<ConsultationItem[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(storageKey) ?? 'null');
            const restored = new Map<string, ConsultationItem>();
            if (Array.isArray(saved?.items)) for (const item of saved.items) {
                if (typeof item?.id !== 'string' || !item.id || typeof item.name !== 'string' || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 999) continue;
                restored.set(item.id, { id: item.id, name: item.name, quantity: Math.min(999, (restored.get(item.id)?.quantity ?? 0) + item.quantity) });
            }
            // Restore browser-only storage after hydration.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setItems([...restored.values()]);
        } catch { /* Storage may be unavailable or contain invalid JSON. */ }
        setLoaded(true);
    }, [storageKey]);

    useEffect(() => {
        if (!loaded) return;
        try { localStorage.setItem(storageKey, JSON.stringify({ items })); }
        catch { /* Keep the consultation usable when browser storage is unavailable. */ }
    }, [items, loaded, storageKey]);

    function clearItems() {
        try { localStorage.removeItem(storageKey); } catch { /* Storage is optional. */ }
        setItems([]);
    }

    function updateQuantity(id: string, quantity: number, stock?: number | null) {
        if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > Math.min(999, stock ?? 999)) return;
        setItems((current) => current.map((item) => item.id === id ? { ...item, quantity } : item));
    }

    function addItem(item: Omit<ConsultationItem, 'quantity'>, quantity = 1) {
        if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 999) return;
        const limit = Math.min(999, item.stock ?? 999);
        const added = Math.max(0, Math.min(quantity, limit - (items.find(entry => entry.id === item.id)?.quantity ?? 0)));
        if (!added) { toast.info('Ya agregaste la cantidad disponible de esta variante.', { toastId: 'consultation-limit', position: 'bottom-right' }); return; }
        setItems((current) => current.some((entry) => entry.id === item.id)
            ? current.map((entry) => entry.id === item.id ? { ...entry, quantity: Math.min(limit, entry.quantity + quantity) } : entry)
            : [...current, { ...item, quantity: Math.min(limit, quantity) }]);
        notifyConsultationAdded(item.name, added);
    }

    return (
        <ConsultationContext.Provider value={{ items, count: items.reduce((total, item) => total + item.quantity, 0), addItem, updateQuantity, removeItem: (id) => setItems((current) => current.filter((item) => item.id !== id)), clearItems }}>
            {children}
        </ConsultationContext.Provider>
    );
}

export function useConsultation() {
    const context = useContext(ConsultationContext);
    if (!context) throw new Error('useConsultation debe usarse dentro de ConsultationProvider');
    return context;
}
