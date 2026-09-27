import type { Locale } from "@/components/site/types";
import { aiAgentInstructionsDe } from "./ai-agent-instructions.de";
import { aiAgentInstructionsEn } from "./ai-agent-instructions.en";
import { entityConnectionsDe } from "./entity-connections.de";
import { entityConnectionsEn } from "./entity-connections.en";
import type { EntityMap, FactSheet } from "./types";

export const aiAgentInstructions: Record<Locale, FactSheet> = { en: aiAgentInstructionsEn, de: aiAgentInstructionsDe };

export const entityConnections: Record<Locale, EntityMap> = { en: entityConnectionsEn, de: entityConnectionsDe };
