import WholesaleGuide from "@/components/sections/wholesaleGuide/WholesaleGuide";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Venta por mayor | El Arcángel",
  "Armá tu consulta mayorista de santería y regalería. Conocé los pasos para consultar precios, cantidades y disponibilidad en El Arcángel.",
  "/mayoristas",
);

export default function WholesalePage() {
  return (
    <main>
      <WholesaleGuide />
    </main>
  );
}
