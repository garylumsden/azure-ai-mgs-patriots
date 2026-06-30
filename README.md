# The Patriots Council

> *"We're not hiding the truth. We're creating it."*

A multi-agent **deliberation** demo on **Microsoft Foundry** and Azure, themed on the **Patriots
(“La‑li‑lu‑le‑lo”)** of the *Metal Gear Solid* saga. Twelve AIs — the long-dead **Wisemen's Committee** —
convene to rule on a **Proposal** for one of the Patriots' grand plans (*Les Enfants Terribles*, the S³
Plan, Sons of the Patriots, the war economy, the AI network…). They hold a live, parliament-style debate
and produce a structured **Assessment**; a **Nexus Analyst** then links each verdict to the plans that
came before.

## The council of twelve

| Seat | Persona | Remit |
|---|---|---|
| **Chair** | Major Zero — Cipher | Founder; weighs the council and renders the verdict |
| **Moderator** | JD — John Doe | Core AI; directs the floor (routing only) |
| **Nexus Analyst** | Sigint — Donald Anderson | Links each verdict to prior plans |
| Member | GW — George Washington | Foundational order & system architecture |
| Member | TJ — Thomas Jefferson | Liberty & the illusion of freedom |
| Member | AL — Abraham Lincoln | Unity & preservation of the system |
| Member | TR — Theodore Roosevelt | Force, expansion & the war economy |
| Member | Big Boss — Naked Snake | The soldier's truth & battlefield reality |
| Member | EVA — Big Mama | Espionage, deception & the human cost |
| Member | Para-Medic — Dr. Clark | Genome, bioethics & control of life |
| Member | Revolver Ocelot — ADAM | Manipulation, misdirection & the long game |
| Member | The Boss — The Joy | The original will & the council's conscience |

GW, TJ, AL and TR are the four Patriots AIs named after US presidents; **JD** is the core, the odd one
out. The remaining seven seats are filled by the Patriots' human founders, whose wills the
network encodes. Members may cite **metalgear.fandom.com** via the grounding tool for lore.

> Built on a reusable, scenario-neutral engine. To re-theme or adjust the roster, edit `config/` or
> re-run the **Scenario Architect** agent (`.github/agents/scenario-architect.agent.md`).

---

## Quickstart

### 1. The scenario is already configured

This repo ships configured for **The Patriots Council** — `config/scenario.json` plus a persona prompt
per seat in `config/prompts/*.md`, an emblem at `wwwroot/branding/logo.svg`, and five sample Proposals in
`data/policies/`. Prompts are read at **startup**, so editing a persona and restarting is enough — no
rebuild. To adjust the roster, branding, or grounding, edit `config/scenario.json` (or re-run the
**Scenario Architect** agent, `.github/agents/scenario-architect.agent.md`).

### 2. Provision Azure (Bicep via `azd`)

```bash
# (Optional) supply a Microsoft Web IQ key so the Web IQ grounding tool is provisioned.
# Web IQ is limited-access (preview) — request a key from the Web IQ team. Skip this to run
# ungrounded, or switch grounding to Foundry IQ in the UI.
azd env set WEBIQ_API_KEY <your-web-iq-key>

azd up
```

Provisions Foundry (AI Services + project), model deployments, Cosmos DB, Blob Storage, AI Search, and
App Insights — all **identity-based (zero keys)**. The Web IQ key (if set) flows into Bicep
(`main.parameters.json` reads `${WEBIQ_API_KEY}`) → Key Vault + a CustomKeys connection. Post-provision
hooks write a local `.env`; for **local MAF mode** also add `WEBIQ_API_KEY=<key>` to
`src/GovernanceCouncil.Web/.env`. (Keyless alternative: bind the project MI in the Web IQ portal and use
AAD, scope `https://api.microsoft.ai/.default`.)

### 3. Run locally

```bash
dotnet run --project src/GovernanceCouncil.Web
```

The app **runs locally** and reads `config/scenario.json` at startup. Upload a Markdown dossier, choose
a deliberation, and watch the council debate.

---

## The scenario config

Everything scenario-specific lives in **`config/`** (read at startup; see
`config/scenario.example.json` for a complete, commented example):

```jsonc
{
  "branding": {
    "organisation": "Contoso Engineering",      // optional eyebrow
    "appName": "Architecture Review Board",      // app + nav title
    "tagline": "Design decisions, deliberated.",
    "emblem": "🏛️"                                // emoji, or "branding/logo.svg"
  },
  "groundingDomains": ["learn.microsoft.com"],   // [] = ungrounded (reason from the dossier only)
  "council": {
    "chair":        { "id": "chair",        "name": "...", "role": "...", "tier": "Synthesis", "promptFile": "chair.md" },
    "moderator":    { "id": "moderator",    "name": "...", "role": "...", "tier": "Fast",      "promptFile": "moderator.md" },
    "nexusAnalyst": { "id": "nexus-analyst","name": "...", "role": "...", "tier": "Synthesis", "promptFile": "nexus-analyst.md" },
    "members": [
      { "id": "security", "name": "Security Architect", "role": "Threat Modelling",
        "description": "...", "tier": "Reasoning", "knowledgeDomains": ["learn.microsoft.com"],
        "promptFile": "security.md" }
    ]
  }
}
```

- **Prompts are on disk** (`config/prompts/*.md`) — edit a persona and restart; no rebuild.
- **Chair / Moderator / Nexus Analyst** are framework roles with built-in scenario-neutral default
  prompts; override only if you want to.
- **Tiers** map roles to model tiers: `Reasoning` (members), `Synthesis` (chair/nexus), `Fast`
  (moderator/bids).
- Resolution: `COUNCIL_SCENARIO_PATH` env var → nearest `config/scenario.json` → neutral defaults.

---

## How it works

- **Two runtimes** behind one seam (`ICouncilRuntime`), switchable in the UI:
  - **Foundry Agents** (default) — one tooled **Prompt Agent** per member, provisioned in the project.
  - **Local MAF Agents** — Microsoft Agent Framework agents over the Foundry **chat models**,
    in-process; bids & speaker-selection run on a fast model.
- **Model profiles** (`COUNCIL_MODEL_PROFILE`, default `Fast`): `Frontier` / `Balanced` / `Fast` /
  `Grok` — a quality↔speed ladder selecting the model set across tiers.
- **Per-tier reasoning effort** (GPT-5 / o-series, and xAI **grok-4.3**): `minimal`/`none` bids ·
  `low` members · `medium` synthesis. Override with `COUNCIL_REASONING_EFFORT`. (The `Grok` profile
  uses grok-4.3, a single tunable reasoning model that honours `reasoning_effort`; older grok-4.1-fast
  ignores it.)
- **Grounding** (toggle in UI): **Web IQ** or **Foundry IQ**, each scoped to the scenario's
  authoritative domains (the Chair gets them all). No domains ⇒ ungrounded. In MAF mode the grounding
  tool is bounded per turn (3-iteration cap + a hard 2-call search budget) so a tool-eager model can't
  fire dozens of search calls per turn.
- **Nexus retrieval is efficient**: each assessment's summary is embedded once at creation and stored;
  Top-K candidate retrieval uses **Cosmos DB NoSQL vector search** (no corpus re-embedding).
- **Live debate** over SignalR: per-seat hand-raises, push-to-talk, citations, a scrolling transcript.

See `ARCHITECTURE.md` for the full picture and `docs/DESIGN.md` for the design system.

---

## Project structure

```
config/                     # scenario.json (+ prompts/) — the only scenario-specific config
  scenario.example.json     # a complete, commented example (not loaded)
  prompts/                  # config/prompts/<id>.md — one per persona
data/policies/              # sample dossiers (Markdown)
infra/                      # Bicep IaC (azd) — identity-based, zero keys
src/
  GovernanceCouncil.Core/   # domain models + scenario config (ScenarioConfig, Scenario, CouncilMembers)
  GovernanceCouncil.Data/   # Cosmos + Blob (identity auth)
  GovernanceCouncil.Agents/ # debate engine, runtimes, nexus, provisioning, grounding
  GovernanceCouncil.Web/    # Blazor Server UI + SignalR
.github/agents/scenario-architect.agent.md   # the guided setup agent
```

> The code namespace stays `GovernanceCouncil.*` as the framework's internal name — it is not shown to
> end users (branding is fully configurable).

---

## Customising further

- **Branding / look & feel**: the dark "council chamber" theme lives in `wwwroot/app.css` (CSS custom
  properties). Branding strings + emblem come from `config/scenario.json`; the theme is shared by
  default. Drop an SVG/PNG in `wwwroot/branding/` and point `emblem` at it.
- **Vocabulary**: the framework's domain language (Dossier / Deliberation / Assessment / Nexus /
  Council) is fixed in code; use your scenario's own words in prompts and sample documents.

## Content safety (RAI policy)

Every chat model deployment is bound to a custom content-safety policy
(`Microsoft.CognitiveServices/accounts/raiPolicies`, in `infra/`). Thresholds default to `Medium` for
all four harm categories (identical to `Microsoft.Default`), and the Foundry agents inherit the policy
because they run on the bound deployments.

**This scenario relaxes Violence to `High`.** The council debates fictional Patriot plans in character,
which the default `medium` violence filter blocks on the model's *completions* — failing deliberations.
Blocking only at `High` (Low/Medium pass) keeps runs flowing. It is set as an `azd` env override — no
Bicep edits:

```bash
azd env set COUNCIL_CONTENT_VIOLENCE_THRESHOLD High
azd provision
```

> `.azure/` is machine-local and gitignored, so this override does **not** travel with the repo — run the
> `azd env set` on any new machine/environment before `azd provision` (or change the default in
> `infra/main.parameters.json`).

Overridable env vars (`Low` | `Medium` | `High`, default `Medium`): `COUNCIL_CONTENT_HATE_THRESHOLD`,
`COUNCIL_CONTENT_SEXUAL_THRESHOLD`, `COUNCIL_CONTENT_VIOLENCE_THRESHOLD`,
`COUNCIL_CONTENT_SELFHARM_THRESHOLD` (plus `COUNCIL_CONTENT_POLICY_NAME` to rename the policy). A higher
threshold blocks **less**.

**No approval is needed to raise a threshold.** Adjusting severity thresholds (Low/Medium/High),
separately for prompts and completions, is available to all customers. Approval (Azure OpenAI *modified
content filters*, managed customers only) is required **only** to turn a category fully **off** or to
**Annotate-only** — not to change a threshold. See
[Configure content filters](https://learn.microsoft.com/azure/ai-foundry/openai/how-to/content-filters).

If a turn is still blocked, the engine degrades gracefully: the block becomes a **Defer** assessment
whose Chair Summary explains it, rather than failing the whole deliberation.

## Conventions

- **.NET 10**, C# 13 idioms (records, primary constructors, file-scoped namespaces).
- **Identity-based auth everywhere** (`DefaultAzureCredential`) — no keys or connection strings.
- **100% IaC** — all Azure resources via Bicep / `azd`.
