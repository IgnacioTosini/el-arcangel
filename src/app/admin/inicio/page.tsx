import HomeSettings from "@/components/admin/homeSettings/HomeSettings";

import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Contenido del inicio | El Arcángel",
};
export default function HomeSettingsPage() {
  return <HomeSettings />;
}
