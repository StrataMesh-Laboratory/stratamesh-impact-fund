# Payouts

## Separation

```
Fund Application  →  payout instruction  →  Payment Provider  →  EUR/USD
```

Not:

```
Fund Application holds bank credentials / cards
```

## Contributor flow

1. Claim profile (GitHub auth)  
2. Confirm contact email  
3. Register payout method with provider  
4. Fund stores opaque recipient id  

## Epoch payment

1. Allocation approved  
2. Instruction batch to provider  
3. Status tracked: pending → submitted → paid / failed  
4. Public epoch report lists amounts against contributor profiles (not private bank data)
