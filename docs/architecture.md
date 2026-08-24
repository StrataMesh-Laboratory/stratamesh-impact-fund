# Architecture — StrataMesh Impact Fund

## Control sentence

**GitHub is the evidence layer. The Fund is the interpretation, transparency and payment layer.**

## Diagram

```
                 GitHub
                   │
          GitHub App / API
                   │
           ┌───────▼────────┐
           │  Data Collector │  webhooks + periodic sync
           └───────┬────────┘
                   │
           raw events / stats
                   │
           ┌───────▼────────┐
           │ Normalizer /   │
           │ Aggregator     │
           └───────┬────────┘
                   │
           ┌───────▼────────┐
           │ Contribution   │  PostgreSQL or D1 (lab)
           │ Database       │
           └───────┬────────┘
                   │
       ┌───────────┴───────────┐
       ▼                       ▼
 Contributor profiles     Fund dashboard
       │                       │
       ▼                       ▼
 Payout registration      Donor interface
       │                       │
       └───────────┬───────────┘
                   ▼
            Grant allocation
                   │
                   ▼
           Payment provider (tokenized)
```

## Dual ingestion

| Path | Role |
|------|------|
| Webhooks | Near-real-time: PR, review, issue, push, release |
| Periodic API sync | Reconciliation; handle 202 on stats endpoints |

Webhook endpoint shape: `POST /api/github/webhook` — **record only**; async worker computes.

## Epochs

Example: Epoch 001 = 1 Sep → 30 Sep 2026.

At close:

1. Freeze contribution dataset  
2. Compute statistics  
3. Publish dataset version + methodology id  
4. Calculate / approve allocations  
5. Open next epoch  

Historical numbers must not silently rewrite.

## Reproducible allocation artifact

```
epoch-001/
  raw/
  normalized/
  metrics/
  allocation/
  methodology.json
```

Optional later: SHA-256 → Merkle root → optional StrataMesh anchor.  
**V0 must not depend on the StrataMesh ledger.**

## Stack (lab deployment)

Aligned with Calhegas Morais environment where practical:

| Concern | Choice |
|---------|--------|
| Public site + API | Cloudflare Worker (`stratamesh-fund`) |
| Data | D1 (lab) → PostgreSQL when volume warrants |
| Auth | GitHub OAuth / GitHub App |
| Payments | External regulated provider (tokenized IDs only) |
| Domain | `fund.calhegasmorais.pt` |

Application code remains open in this repository so the funding model is inspectable independently of protocol code in `stratamesh-core`.

## Hard problems (design focus)

Identity · attribution · interpretation · fairness · gaming · legal entitlement to payment  

GitHub integration is the easy part.
