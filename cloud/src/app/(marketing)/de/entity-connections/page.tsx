import { EntityMapPage, entityMapMetadata } from "@/components/site/facts/entity-map-page";

export const metadata = entityMapMetadata("de");

export default function GermanEntityConnectionsPage() {
  return <EntityMapPage locale="de" />;
}
