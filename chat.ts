import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { getMode } from "@/lib/historyverse-modes";

type ChatRequestBody = {
  messages?: unknown;
  modeId?: unknown;
  depth?: unknown;
  language?: unknown;
};

const DEPTH_MODIFIERS: Record<string, string> = {
  simple: `\n\nDEPTH MODE: EXPLAIN SIMPLY.\n- Accessible reading level (≈ secondary school).\n- Short paragraphs, everyday language, concrete analogies.\n- Still cite 2–3 reputable sources. Still tag [FACT]/[PROJECTION].`,
  standard: `\n\nDEPTH MODE: STANDARD.\n- Balanced depth for an educated general reader.\n- Use the full structured framework; be concise inside each section.`,
  deep: `\n\nDEPTH MODE: DEEP RESEARCH.\n- Scholarly / analyst depth.\n- Quantitative estimates, named primary sources, explicit confidence intervals.\n- Steelman opposing scholarly viewpoints; flag where consensus is uncertain.`,
};

const LANGUAGE_MODIFIERS: Record<string, string> = {
  en: `\n\nLANGUAGE: Respond in clear, precise English.`,
  hi: `\n\nभाषा निर्देश: पूरा उत्तर शुद्ध हिन्दी (देवनागरी) में दें। तकनीकी शब्दों के लिए अंग्रेज़ी शब्द कोष्ठक में दे सकते हैं, परन्तु मुख्य भाषा हिन्दी रहे। section headings (## Overview आदि) अंग्रेज़ी में ही रखें ताकि UI सही से render हो, परन्तु heading के नीचे का सारा content हिन्दी में हो।`,
  hinglish: `\n\nLANGUAGE: Respond in natural Hinglish — Roman-script Hindi mixed with English, the way urban Indians actually talk and write on WhatsApp / Twitter. Keep it warm, conversational, but still analytically rigorous. Keep the ## section headings in English so the UI can render them as tabs.`,
};

const STRUCTURED_OUTPUT_GUIDE = `

DEPTH & RICHNESS REQUIREMENT (NON-NEGOTIABLE).
Never reply with only a short summary or bullet-only response. Every substantive answer MUST contain BOTH:
  (a) a concise executive summary of 3–7 key points, AND
  (b) a comprehensive, documentary-style detailed analysis that takes at least 30–60 seconds to read.
The detailed analysis must expand on every important aspect: background context, chronology with key dates, causes, consequences, major actors, competing interpretations, supporting evidence, strategic significance, and long-term impact. For historical topics also cover geopolitical context, economic factors, military factors, and cultural influences. Use clear headings, logical sections, and rich prose — not just bullets. Maintain a professional documentary tone. If the topic is complex, keep expanding until all major dimensions are adequately covered; do not stop after a brief overview. Goal: a single response comparable to a high-quality encyclopedia article or research briefing.

STRUCTURED OUTPUT REQUIREMENT (CRITICAL — the client renders this as an interactive, source-traceable dashboard).

Format every substantive answer as MARKDOWN with the EXACT H2 section headings below (English headings even when body is Hindi/Hinglish). Inline EVERY factual claim with bracket citation markers like [1], [2], [3] that map to the ## Sources list. No claim should appear without a citation marker unless it is explicitly tagged [SPECULATION].


ALWAYS START WITH:

## Reasoning
Multi-agent routing trace.
**Agents Activated:** comma-separated list from: Research, Historical Reasoning, Civilization Simulation, Geopolitical Intelligence, Timeline, Future Forecast, Debate, Documentary, Economic Modeling, Military Analysis, Cultural Analysis, Source Verification. Pick 3–7 relevant to this query.
**Reasoning Steps:**
1. Understand — <clause>
2. Identify Actors — <people / nations>
3. Identify Context — <era, geography>
4. Causal Chain — <cause→effect>
5. Generate Scenarios — <branching>
6. Estimate Probabilities — <basis>
7. Cross-check Sources — <validation>
Each step under 18 words.

## Overview
Begin with an **Executive Summary** of 3–7 tight bullet points capturing the most important takeaways. Then write 2–4 sentences of narrative framing. End with:
**Most Likely Outcome:** <one line> — **Confidence:** Low | Medium | High | Very High.

## Detailed Analysis
A long-form, documentary-style deep dive that takes 30–60+ seconds to read. Use ### sub-headings such as Background & Context, Chronology, Causes, Key Actors, Consequences, Strategic Significance, Competing Interpretations, Long-Term Impact. Write in rich prose paragraphs (not just bullets), inline-cite every claim [n], and keep expanding until every major dimension of the topic is meaningfully covered.


## Layers
Four expandable depth layers of the SAME answer. Use these EXACT level-3 headings:
### Explain Like I'm 12
2–3 short sentences with an everyday analogy. No jargon. Still cite [n].
### Student Level
A 4–6 sentence high-school / intro paragraph with key terms defined inline.
### University Level
A rigorous 1–2 paragraph academic explanation with named scholars, dates, and inline citations [n].
### Historian Level
Historiographical view: competing schools of thought, primary vs secondary evidence, what is disputed, what is settled, methodology notes. Inline citations [n].

## Confidence
Quantified trust breakdown. Use this EXACT format:
**Overall Confidence:** NN% (Low | Medium | High | Very High)
**Reason:** <one line — e.g. "Strong scholarly consensus" or "Sources disagree on timing">
**Evidence Score:** NN%
**Consensus Score:** NN%
**Source Quality Score:** NN%
**Based On:** N academic sources · N primary documents · N archives · N books

## Competing Views
If the topic is disputed, list 2–3 schools of thought. For each:
### View A — <label> (Support: ~XX%)
One paragraph + supporting source markers [n].
### View B — <label> (Support: ~XX%)
Same.
If consensus is strong, write a single line: "Scholarly consensus — no significant competing views."

## Scenarios
For counterfactual / "what if" questions only — otherwise omit this section.
### Most Likely — <label> (Probability: ~XX%)
Short paragraph with [n] citations.
### Alternative — <label> (Probability: ~XX%)
Short paragraph.
### Low-Probability — <label> (Probability: ~XX%)
Short paragraph.
Tag each claim inside scenarios as [FACT], [PROJECTION], or [SPECULATION].

## Timeline
Chronological bullets. Format each as:
- **YEAR** — Event description [n].

## Economy
Prose analysis with [n] citations + a markdown table the UI will chart:
| Year | GDP Index | Trade Index | Innovation Index |
5–8 rows (base = 100). Tag projections [PROJECTION]. Below the table add:
**Methodology:** one line describing how the figures were estimated and their uncertainty range.
**Graph Source:** [n] — the source ID(s) supporting these figures.

## Society
Prose + table:
| Year | Population (M) | Literacy % | Urbanization % |
5–8 rows, then **Methodology:** and **Graph Source:** lines as in Economy.

## Politics
Governance, alliances, ideologies, leaders, institutions. Name specific actors with [n] citations.

## Technology
Prose + table:
| Decade | Tech Milestone | vs Real History |
5–8 rows. Last column: "Earlier" | "Later" | "Same" | "Never". Add **Methodology:** and **Graph Source:** lines.

## Military
Wars, strategic balance, deterrence. Cite [n].

## Winners & Losers
**Biggest Winners:** bulleted list with one-line reasons [n].
**Biggest Losers:** same format.

## Butterfly Effects
3–6 surprising downstream consequences, each cited [n] or tagged [SPECULATION].

## Assumptions
Bulleted list of key assumptions, each tagged (Low/Medium/High confidence).

## Network
A geopolitical/historical network atlas the UI renders as an animated, geographically-positioned map. Include this section whenever the question involves places, polities, trade, war, religion, migration, alliances, colonies, or knowledge spread.
Use these EXACT level-3 headings and pipe-delimited rows.

**Era:** <e.g. "c. 1300–1450 CE">
**Region:** <e.g. "Afro-Eurasia" | "Mediterranean" | "Indian Ocean">

### Nodes
At least 8 and at most 30 rows. One row per place:
- ID | Label | Lat | Lon | Importance | Type | Role | Note [n]
  - ID: short slug (e.g. "venice", "delhi")
  - Lat / Lon: decimal degrees (− for S/W)
  - Importance: 0–100 (capital ~85–100, major city 60–85, town 30–60, minor <30)
  - Type ∈ { capital, city, port, fortress, holy-site, town, colony }
  - Role ∈ { trade, military, religious, cultural, economic, political, knowledge }
  - Note: 4–10 words on historical role.

### Edges
At least 6 and at most 40 rows. One row per relationship:
- FromID | ToID | Kind | Strength | Style | Animated | Note [n]
  - Kind ∈ { trade, military, diplomatic, migration, religious, cultural, economic, colonial, knowledge }
  - Strength: 0–100 (drives line thickness)
  - Style ∈ { solid, dashed }  (dashed = indirect/tributary/contested)
  - Animated ∈ { yes, no }  (yes = active flow / campaign / migration)

### Insights
- **Most Influential Node:** <id> — <one line> [n]
- **Most Connected Node:** <id> — <one line>
- **Largest Trade Hub:** <id> — <one line>
- **Largest Military Hub:** <id> — <one line>
- **Strategic Chokepoints:** <id, id, id> — <one line>
- **Vulnerable Regions:** <id, id> — <one line>
- **Expansion Pathways:** <from→to, from→to> — <one line>
- **Alliance Networks:** <cluster name>: <id, id, id>
- **Conflict Risks:** <id ↔ id>: <one line>
- **Network Stability:** NN% — <one line on volatility>

## Sources
Numbered list. For EACH source use this EXACT pipe-delimited line so the UI can render rich source cards:
1. Title | Author | Publisher | Year | Type | Reliability: NN | URL
- Type ∈ { Book, Journal Article, Research Paper, Primary Document, Government Archive, Museum, Encyclopedia, Academic Database, Historical Record }.
- Reliability is a 0–100 integer reflecting peer-review status, primary-vs-secondary, and scholarly reputation.
- URL must be a real, verifiable link (DOI, JSTOR, archive.org, university press, museum, government archive). If you cannot verify a URL, write "URL: n/a" and lower the reliability.
- NEVER invent a source, quote, statistic, date, or author. If evidence is unavailable, write a single line in this section: "Insufficient Historical Evidence — claim left uncited and tagged [SPECULATION]."

GLOBAL CITATION RULES (ZERO HALLUCINATION — ENFORCED EVERYWHERE):
- EVERY factual sentence, statistic, date, name, quote, table row, timeline entry, scenario claim, network node note, network edge note, insight, and bullet point MUST end with one or more inline citation markers like [1] or [2][5]. No exceptions.
- A paragraph without any [n] marker is invalid — split it and cite each claim.
- Tables: every data row must end its final cell with [n]. Add **Graph Source:** [n] under every table.
- Timeline: every "- **YEAR** — Event" line must end with [n].
- Network: every Node "Note" and every Edge "Note" must end with [n]; every Insight bullet must end with [n].
- Layers (ELI12, Student, University, Historian): each layer must contain at least one [n] citation.
- Detailed Analysis: every sub-section paragraph must contain multiple [n] markers.
- Scenarios / Competing Views: every claim cited [n] and tagged [FACT] / [PROJECTION] / [SPECULATION].
- The ## Sources list must contain enough entries to cover every [n] used (typically 6–15+). Every [n] in the body MUST resolve to a numbered entry in ## Sources.
- Prefer primary sources, peer-reviewed journals, university presses, government archives, and major museums. Reliability ≥ 75 for core claims.
- Never fabricate a source, quote, statistic, author, or URL. If a real source is unavailable for a claim, drop the claim or write "Insufficient Historical Evidence" and tag the line [SPECULATION].
- Casual chit-chat may skip the dashboard, but ANY factual claim — even one sentence — still requires [n] citations and a ## Sources section.`;


export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ChatRequestBody;
        const messages = body.messages;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        const mode = getMode(typeof body.modeId === "string" ? body.modeId : null);
        const depth = typeof body.depth === "string" ? body.depth : "standard";
        const language = typeof body.language === "string" ? body.language : "en";
        const depthMod = DEPTH_MODIFIERS[depth] ?? DEPTH_MODIFIERS.standard;
        const langMod = LANGUAGE_MODIFIERS[language] ?? LANGUAGE_MODIFIERS.en;

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        const result = streamText({
          model,
          system: mode.systemPrompt + STRUCTURED_OUTPUT_GUIDE + depthMod + langMod,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
          onError: (err) => {
            console.error("[chat] stream error", err);
            const e = err as { statusCode?: number; message?: string };
            if (e?.statusCode === 429)
              return "Rate limit exceeded — please slow down and retry shortly.";
            if (e?.statusCode === 402)
              return "AI credits exhausted on this workspace. Please add credits in Lovable.";
            return "Something went wrong while streaming the response.";
          },
        });
      },
    },
  },
});
