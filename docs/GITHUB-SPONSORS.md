# GitHub Sponsors — status

## Live

| Account | Public? | URL |
|---------|---------|-----|
| `@amcmorais` | **Yes** (`isPublic: true`) | https://github.com/sponsors/amcmorais |
| `StrataMesh-Laboratory` | **Pending staff approval** (`listing` exists, `isPublic: false`) | https://github.com/sponsors/StrataMesh-Laboratory |

## Legal umbrella

StrataMesh Laboratory is not a separate legal person. It operates **under AMCM ENI** (André Manuel Calhegas Morais — Empresário em Nome Individual).

Organisation Sponsors therefore uses the **same payout / tax account data** as the personal `@amcmorais` Sponsors profile. That is intentional and correct for ENI structure — not a duplicate company.

GitHub staff review org profiles even when banking matches an already-approved personal listing. Until `isPublic: true` on the org:

- Prefer **https://github.com/sponsors/amcmorais** for grants
- Or **https://calhegasmorais.pt/pagamentos** (ENI EUR rail)
- Fund API: `GET /api/v1/sponsors` → `organization.pending: true`

When staff approves, GraphQL flips `isPublic` and the Fund prefers the org URL automatically. Then set:

```yaml
github: [amcmorais, StrataMesh-Laboratory]
```

in `.github/FUNDING.yml` across lab repos.
