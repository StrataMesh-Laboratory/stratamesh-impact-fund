# Impact Fund × GitHub Sponsors (operational today)

## Model

1. **Stratification** — capital is expressed as **open challenges** (GitHub Issues with label `impact-challenge`).
2. **Grantor chooses** which problem to fund (issue + rail).
3. **Problem stays open** until grantee(s) `/accept` and deliver against **objective metrics** in the issue body.
4. **Rails (today)**
   - [GitHub Sponsors](https://github.com/sponsors/amcmorais) — preferred when listing is active (onboarding at github.com/sponsors).
   - [ENI /pagamentos](https://calhegasmorais.pt/pagamentos) — EUR bank instruction **already live**.
   - Repo [FUNDING.yml](../.github/FUNDING.yml) — Sponsors login + Fund + ENI links on every Sponsor button surface.

## Fund surfaces

- https://fund.calhegasmorais.pt/challenges
- `GET /api/v1/challenges` · `GET /api/v1/sponsors` · `GET /api/v1/health`

## Agreement

Metrics checklists live on the Issue. Label `metrics-agreed` when grantor and grantee lock criteria. Close issue when metrics pass; release grant via the same rail used to fund.


## Honest envelope (not treasury)

V0 has **no deposited, pledged, or reserved EUR**. The Orçamento column on https://fund.calhegasmorais.pt/challenges is **not a treasury**.

Rules:

1. Default public state: `0 — no current funding yet`.
2. Issue body must include `## Funded` / `false` until a grantor deposits on a rail **and** links a receipt.
3. A bare integer in `## Budget envelope (EUR)` (the 150 incident) is **withheld**. The worker renders `0 · sem financiamento` / `0 · no current funding yet`.
4. `metrics-agreed` is about acceptance criteria, not cash. Do not treat a placeholder envelope as funded.

Incident: [impact-fund#1](https://github.com/StrataMesh-Laboratory/stratamesh-impact-fund/issues/1) (Challenge 0) — phantom 150 withdrawn 2026-08-27.
