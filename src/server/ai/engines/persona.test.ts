import { describe, expect, it } from "vitest";
import { ENGINES } from "@/lib/engines";
import {
  NO_ANSWER_MARKER,
  mapSimulation,
  parsePersonaText,
  personaFor,
  simulationSchema,
  simulationSystemPrompt,
  simulationUserPrompt,
  stripSourcesSection,
} from "./persona";

const cites = [
  { url: "https://www.test.de/balkonkraftwerke", title: "Balkonkraftwerke im Test", position: 1 },
  { url: "https://www.solakon.de/", title: null, position: 2 },
];

describe("simulationSchema", () => {
  it("accepts the structured simulation result", () => {
    const data = simulationSchema.parse({ noAnswer: false, text: "Answer", fanouts: ["q1"] });
    expect(data).toEqual({ noAnswer: false, text: "Answer", fanouts: ["q1"] });
  });

  it("rejects incomplete results", () => {
    expect(simulationSchema.safeParse({ text: "Answer" }).success).toBe(false);
    expect(simulationSchema.safeParse({ noAnswer: "no", text: "", fanouts: [] }).success).toBe(false);
  });
});

describe("mapSimulation", () => {
  it("keeps the answer, the backend's real citations and deduped fan-outs (max 10)", () => {
    const fanouts = ["balkonkraftwerk test", "Balkonkraftwerk Test", ...Array.from({ length: 12 }, (_, i) => `query ${i}`)];
    const res = mapSimulation({ noAnswer: false, text: "  Die besten Balkonkraftwerke …  ", fanouts }, cites, true, true);
    expect(res.noAnswer).toBe(false);
    expect(res.text).toBe("Die besten Balkonkraftwerke …");
    expect(res.citations).toEqual(cites);
    expect(res.fanouts).toHaveLength(10);
    expect(res.fanouts[0]).toBe("balkonkraftwerk test");
    expect(res.fanouts[1]).toBe("query 0");
  });

  it("a no-answer result (e.g. no AI Overview) keeps nothing", () => {
    expect(mapSimulation({ noAnswer: true, text: "ignored", fanouts: ["q"] }, cites, true, true)).toEqual({
      noAnswer: true,
      text: "",
      citations: [],
      fanouts: [],
    });
  });

  it("engines that always answer ignore a stray noAnswer flag", () => {
    const res = mapSimulation({ noAnswer: true, text: "ChatGPT answer", fanouts: [] }, cites, true, false);
    expect(res.noAnswer).toBe(false);
    expect(res.text).toBe("ChatGPT answer");
  });

  it("without a real web search there are no citations and no fan-outs", () => {
    const res = mapSimulation({ noAnswer: false, text: "From memory", fanouts: ["invented query"] }, cites, false, false);
    expect(res.citations).toEqual([]);
    expect(res.fanouts).toEqual([]);
  });

  it("drops a trailing sources list the model appended", () => {
    const text = "Empfehlung: Solakon.\n\n**Quellen:**\n- [Test](https://www.test.de)\n- https://www.solakon.de";
    expect(mapSimulation({ noAnswer: false, text, fanouts: [] }, [], true, false).text).toBe("Empfehlung: Solakon.");
  });
});

describe("parsePersonaText (Gemini / OpenAI personas)", () => {
  it("detects the no-answer marker, also when formatted", () => {
    expect(parsePersonaText(NO_ANSWER_MARKER, true)).toEqual({ noAnswer: true, text: "" });
    expect(parsePersonaText(`\`${NO_ANSWER_MARKER}\``, true)).toEqual({ noAnswer: true, text: "" });
    expect(parsePersonaText(`**${NO_ANSWER_MARKER}**.`, true)).toEqual({ noAnswer: true, text: "" });
  });

  it("keeps normal answers and strips a trailing marker or sources list", () => {
    expect(parsePersonaText(`AI Overview text\n${NO_ANSWER_MARKER}`, true)).toEqual({ noAnswer: false, text: "AI Overview text" });
    expect(parsePersonaText("Answer\n\nSources:\n1. https://a.example\n2. https://b.example", false)).toEqual({ noAnswer: false, text: "Answer" });
  });

  it("engines that always answer never produce a no-answer", () => {
    expect(parsePersonaText(NO_ANSWER_MARKER, false).noAnswer).toBe(false);
  });
});

describe("simulation prompts", () => {
  it("has a persona for every engine", () => {
    for (const e of ENGINES) expect(personaFor(e.id).product.length).toBeGreaterThan(3);
  });

  it("puts the market into the system and user prompt (UK → GB)", () => {
    const system = simulationSystemPrompt("chatgpt", "UK", "json");
    expect(system).toContain("United Kingdom (GB)");
    expect(system).toContain("noAnswer is always false");
    expect(simulationUserPrompt("best running shoes", "UK")).toBe("User location: United Kingdom (GB)\n\nQuestion:\nbest running shoes");
  });

  it("AI Overview may show no answer; text mode uses the marker", () => {
    const json = simulationSystemPrompt("ai_overview", "DE", "json");
    expect(json).toContain("Set noAnswer to true");
    expect(json).toContain("Germany (DE)");
    const text = simulationSystemPrompt("ai_overview", "DE", "text");
    expect(text).toContain(`reply with exactly ${NO_ANSWER_MARKER}`);
    expect(simulationSystemPrompt("copilot", "DE", "text")).toContain("Always answer the question.");
  });
});

describe("stripSourcesSection", () => {
  it("leaves answers without a trailing list untouched", () => {
    expect(stripSourcesSection("Sources are important.\nMore text.")).toBe("Sources are important.\nMore text.");
  });
});
