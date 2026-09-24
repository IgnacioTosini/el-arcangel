import { cache } from "react";

import { readCatalog } from "./catalog-database";
import { getApprovedWholesaleAccount } from "./wholesale-auth";

export const readCustomerCatalog = cache(async () => {
  const account = await getApprovedWholesaleAccount();
  const purchaseType = account ? ("WHOLESALE" as const) : ("RETAIL" as const);
  return { ...(await readCatalog(purchaseType)), purchaseType, account };
});
