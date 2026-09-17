import { cache } from 'react';
import { getApprovedWholesaleAccount } from './wholesale-auth';
import { readCatalog } from './catalog-database';

export const readCustomerCatalog = cache(async () => {
    const account = await getApprovedWholesaleAccount();
    const purchaseType = account ? 'WHOLESALE' as const : 'RETAIL' as const;
    return { ...await readCatalog(purchaseType), purchaseType, account };
});
