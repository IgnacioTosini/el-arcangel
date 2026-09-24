import WholesaleAccount from "@/components/sections/wholesaleAccount/WholesaleAccount";
import { getWholesaleAccount } from "@/lib/wholesale-auth";

import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Cuenta mayorista | El Arcángel",
  robots: { index: false, follow: false },
};
export default async function Page() {
  return (
    <main className="accountPage">
      <WholesaleAccount account={await getWholesaleAccount()} />
    </main>
  );
}
