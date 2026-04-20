# UnPAC — Follow the Money

UnPAC lets you enter any U.S. address and instantly see every representative who serves that address — what they vote for, who funds them, and whether their votes align with their donors.

## What it does

1. **Enter your address** — the app resolves your federal, state, and local representatives via the Google Civic Information API.
2. **See your reps** — each representative shows their party, office, photo, and a quick-glance influence score.
3. **Drill into a rep** — click any representative to open a detailed panel with:
   - **Voting record** — recent bills sponsored, co-sponsored, and voted on, categorized across 8 issue areas (Healthcare, Energy, Defense, Economy, Education, Immigration, Environment, and more)
   - **Who funds them** — campaign finance data from the FEC broken down by industry sector, with a bubble chart and ranked contributor list
   - **Influence scores** — two data-driven scores (see below)
   - **AI conflict analysis** — on demand, Claude (Haiku) reads the voting record against donor industries and surfaces specific conflicts of interest

## Influence scores

### Legislative Influence Score (0–100)
Measures how financially captured a legislator is by industries with active regulatory exposure (finance, healthcare, energy, defense, etc.).

Uses an HHI-style concentration formula: a rep whose donations are dominated by a single industry scores higher than one with the same total spread across many sectors. A power curve pushes mid-range scores outward so the distribution is readable at a glance.

- **0** — donations distributed across many non-regulatory industries
- **100** — heavily concentrated in one high-influence sector

### Voting Alignment Score (0–100)
Measures whether a rep's floor votes and bill sponsorships align with the interests of their donor industries.

Voting actions are weighted by signal strength:
| Action | Weight |
|---|---|
| Floor vote Yes | +1.0 |
| Floor vote No | −1.0 |
| Sponsored | +0.4 |
| Co-sponsored | +0.2 |
| Not Voting / Present | 0 |

Donor sectors are mapped to bill categories (e.g. "pharma" → Healthcare, "oil/gas" → Energy). The score is a donor-weighted average of alignment across matched categories.

- **0** — consistently votes against donor industry interests
- **50** — neutral or no clear pattern
- **100** — consistently votes in favor of donor industry interests

## AI conflict analysis

Clicking "Analyze Conflicts of Interest" sends the rep's top 30 weighted legislative actions and top 8 donor sectors to Claude (Haiku). Claude returns a nonpartisan JSON report classifying the overall tension level (High / Medium / Low / None) and listing specific industry-by-industry conflicts with explanations tied to named bills.

## Data sources

| Data | Source |
|---|---|
| Representative lookup | Google Civic Information API |
| Federal legislators & bills | Congress.gov API |
| State legislators | OpenStates API |
| Campaign finance | FEC API |
| AI analysis | Anthropic API (Claude Haiku) |

## Running locally

Copy `.env.local.example` to `.env.local` and fill in your API keys:

```
CONGRESS_API_KEY=
FEC_API_KEY=
GOOGLE_CIVIC_API_KEY=
OPENSTATES_API_KEY=
ANTHROPIC_API_KEY=
```

Then:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech stack

- **Next.js** (App Router) — frontend and API routes
- **Tailwind CSS** — styling
- **Anthropic SDK** — conflict-of-interest analysis
- Data fetched server-side in API routes to keep keys off the client
