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
