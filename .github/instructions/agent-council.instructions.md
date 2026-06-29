---
applyTo: '**'
---
# Copilot Instructions — The Patriots Council

This repository is **The Patriots Council**: a multi-agent **deliberation** demo on **Microsoft
Foundry** + Azure, themed on the **Patriots (“La‑li‑lu‑le‑lo”)** of *Metal Gear Solid*. Twelve AIs (the
long-dead Wisemen's Committee) review a **Proposal** for a Patriot plan, debate it, and produce a
structured **Assessment**; a **Nexus Analyst** then links assessments together. The active roster:
Chair **Major Zero**, Moderator **JD**, Nexus Analyst **Sigint**, and members **GW, TJ, AL, TR,
Big Boss, EVA, Para-Medic, Ocelot, The Boss**.

The scenario is **configuration, not code**: branding, grounding, the council roster, and persona
prompts live in `config/`. The underlying engine is **scenario-neutral** — keep it that way (never bake
the Patriots scenario into `src/**`). To re-theme or adjust the roster, edit `config/` or re-run the
**Scenario Architect** agent (`.github/agents/scenario-architect.agent.md`).

## Golden rules

1. **Scenario lives in config, not code.** Branding, grounding domains, and the council composition
   come from `config/scenario.json`; persona prompts come from `config/prompts/*.md` (on disk, no
   rebuild). Never hard-code a scenario, persona, organisation, or domain into the C#/Razor.
2. **Keep the engine scenario-agnostic.** Do not reintroduce a specific customer/sector into
   `src/**`. Member rosters, ids, and counts are taken from the active scenario at runtime
   (`CouncilMembers` projects `Scenario.Current`). The Chair structured-output schema
   (`DebateSchemas`) is built from the live roster — keep it that way.
3. **Identity-based auth, zero keys.** `DefaultAzureCredential` everywhere; `disableLocalAuth: true`
   on AI Services; Cosmos/Blob/Search via AAD + RBAC. No keys, connection strings, or secrets in code.
4. **100% Infrastructure as Code.** All Azure resources via Bicep (`infra/`), provisioned with `azd`.
   Verify resource schemas and use the latest stable API versions.
5. **.NET 10.** C# 13 idioms — records, primary constructors, file-scoped namespaces, async throughout
   (no `.Result`/`.Wait()`). DI via `Microsoft.Extensions.DependencyInjection`.
6. **Runs locally.** The Blazor Server app is run with `dotnet run --project src/GovernanceCouncil.Web`
   and reads `config/scenario.json` at startup. There is no container/hosted-agent path.
7. **Keep docs in sync.** Update `README.md`, `ARCHITECTURE.md`, `SPEC.md`, and this file when the
   framework, config model, model deployments, or key technical decisions change.

## Scenario configuration model

- `config/scenario.json` → `ScenarioConfig` (Core): `branding`, `groundingDomains`,
  `council.{chair,moderator,nexusAnalyst,members[]}`. Loaded once at startup by `Scenario.Initialise()`.
  Absent ⇒ neutral defaults (generic branding + empty council).
- `PersonaConfig`: `id` (lowercase kebab), `name`, `role`, `description`, `tier`
  (`Reasoning`/`Synthesis`/`Fast`), `knowledgeDomains?`, `promptFile`.
- Prompts: `config/prompts/<promptFile>`. Framework roles (chair/moderator/nexus-analyst) fall back to
  embedded scenario-neutral defaults; members without a file get a minimal identity prompt.
- Branding: `Brand` (Web) projects `Scenario.Current.Branding`; emblem is an emoji or a path under
  `wwwroot/branding/`. Theme tokens live in `wwwroot/app.css` — shared by default.

## Architecture (framework)

- **Runtimes** behind `ICouncilRuntime`: **Foundry Agents** (one tooled Prompt Agent per member,
  provisioned via `AgentProvisioner`) and **Local MAF Agents** (`MafCouncilRuntime`, Microsoft Agent
  Framework over Foundry chat models, in-process). Switchable at runtime.
- **Models**: per-tier deployments selected by `CouncilModels` profiles (`Frontier`/`Balanced`/
  `Fast`/`Grok`). Per-tier reasoning effort via `ReasoningEffortChatClient` (MAF) / agent
  `reasoning:{effort}` (Foundry). Sampling left at model defaults (no custom temperature).
- **Grounding**: `GroundingTools` (MAF) / MCP tool (Foundry), scoped to the member's effective
  domains (`CouncilMembers.DomainsFor`); empty ⇒ ungrounded. Providers: Web IQ / Foundry IQ.
- **Storage**: Cosmos DB (assessments, nexuses, dossiers, deliberations) + Blob (dossier markdown),
  identity-based. Nexus Top-K uses **Cosmos NoSQL vector search** over a persisted `/embedding`.
- **UI**: Blazor Server + SignalR live debate.

## Dependency pins (do not drift)

`Microsoft.Agents.AI.Foundry 1.5.0` needs `OpenAI 2.10.0` (a ctor removed in 2.11.0 breaks the Foundry
bridge). `OpenAI 2.10.0` + `Microsoft.Extensions.AI.OpenAI 10.6.0` are pinned in
`GovernanceCouncil.Agents.csproj` — keep them.

## Domain terminology

| Term | Meaning |
|---|---|
| **Dossier** | A source document submitted for deliberation. |
| **Deliberation** | One council session reviewing a dossier. |
| **Assessment** | The structured output: recommendation, summary, votes, conditions, dissent, risks. |
| **Nexus** | A discovered interconnection between two assessments. |
| **Council Member** | A debating persona (an agent). |
| **Chair / Moderator / Nexus Analyst** | Framework roles: synthesise / route / link. |

Nexus types: `Implication` · `Contradiction` · `Dependency` · `Supersession` · `Reinforcement` ·
`Tension`.

## Build & verify

```pwsh
dotnet build src/GovernanceCouncil.Web/GovernanceCouncil.Web.csproj -v minimal   # 0 errors
cd infra; az bicep build --file main.bicep                                       # exit 0
```
