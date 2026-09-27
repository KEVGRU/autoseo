import { EntityMapPage, entityMapMetadata } from "@/components/site/facts/entity-map-page";

export const metadata = entityMapMetadata("en");

export default function EntityConnectionsPage() {
  return <EntityMapPage locale="en" />;
}
