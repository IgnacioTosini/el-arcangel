'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Refresh server prices, availability and session permissions when returning to a tab.
export default function RefreshOnReturn() {
    const router = useRouter();
    useEffect(() => {
        let lastRefresh = 0;
        function refresh() {
            if (document.visibilityState !== 'visible' || Date.now() - lastRefresh < 2000) return;
            lastRefresh = Date.now();
            router.refresh();
        }
        window.addEventListener('focus', refresh);
        document.addEventListener('visibilitychange', refresh);
        return () => { window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh); };
    }, [router]);
    return null;
}
