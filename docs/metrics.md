# Metrics — descriptive statistics only (V0)

## Rule

GitHub can substantiate **activity**.  
It cannot, by itself, substantiate **€ engineering value**.

Public UI language:

- **Contribution statistics** (V0)  
- **Impact indicators** (later phase — explicit methodology)

Never present a single “Objective Impact Score” in V0.

## Families

### Volume
- commits  
- PRs opened / merged  
- issues opened / closed  
- reviews submitted  

### Code
- additions  
- deletions  
- files changed  

### Collaboration
- reviews performed  
- PRs reviewed  
- distinct peers interacted with (when available)  

### Persistence
- active weeks / months  
- activity consistency across the epoch  

### Breadth
- distinct StrataMesh repositories touched  

### Delivery
- merge rate (merged / opened PRs)  
- releases that include contributor changes (when attributable)  

## Evidence links

Every material number on a profile MUST offer a path to GitHub evidence  
(commit URL, PR URL, compare view, or API query documentation).

## What is excluded from V0 scoring claims

- Cyclomatic complexity as “value”  
- AI commit quality scores  
- Automatic € conversion from LOC  
- Roadmap phase multipliers as money weights (may appear later as *indicators* only)

## Grantor executive summaries (V0.4.6)

Contributor `summary.executive_pt` / `summary.executive_en` are **interpretations of GitHub evidence** for grantors (contributor totals, in-scope repos, recent public commit/PR/issue titles with links).

They are **not** value scores, **not** STRATA, **not** treasury, and **not** an AI impact score. If the GitHub API returns no titles, the brief must say evidence is missing.

Challenge ranking (`GET /api/v1/ranking`) counts only challenge-linked work on this repo’s posted issues #1–#9: `/accept`, assignment (not merely opening the issue as grantor), and PRs that GitHub cross-references to those issues. Comments on those issues are listed as **activity, not delivery**.
