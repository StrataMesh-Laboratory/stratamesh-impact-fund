# Payouts — contributor donation accounts

## Principle

Each discovered contributor is listed with a **linked payout account** when one exists.
The Fund never stores raw IBAN/card numbers.

## Paths

### 1. Operator (already live)

| Field | Value |
|-------|--------|
| GitHub | `@amcmorais` |
| Method | `eni_pagamentos` |
| Widget | https://calhegasmorais.pt/pagamentos |
| API | `POST /api/payment-intent` with `purpose: "donation"` |
| Behaviour | Unique bank-transfer instruction; IBAN applied server-side, not indexed on the public page |

Fund UI embeds / links this widget for the operator profile.

### 2. Other contributors — register account

1. GitHub OAuth login (stable `github_user_id`)
2. Explicitly confirm **public-domain email** (GitHub-registered preferred)
3. Register payout with an external provider
4. Fund stores only: `payout_provider`, `payout_recipient_id` (opaque), `status`

### 3. Other contributors — grantor prepaid card

1. Grantor selects an option from the **API-integrated prepaid catalog** (`GET /api/v1/prepaid-providers`)
2. Redirect to the provider purchase page
3. Card / instrument is sent to the contributor’s **GitHub-registered public-domain email**

No card PAN is stored in the Fund database.

## Separation

```
Fund Application  →  payout instruction / redirect  →  Provider  →  EUR/USD
```

## Epoch batch (Phase 3)

1. Allocation approved against claimed profiles with active payout method
2. Operator grants may use `/pagamentos` references
3. Registered accounts: provider batch
4. Prepaid: grantor purchase + email delivery
5. Public epoch report lists amounts vs profiles — never private bank data
