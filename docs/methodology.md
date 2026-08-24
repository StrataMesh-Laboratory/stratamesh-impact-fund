# Allocation methodology

## V0 stance

Administrators publish:

1. Frozen epoch statistics (from GitHub-derived data)  
2. A versioned methodology file (`methodology/v0.x.json`)  
3. Allocation results with amounts and recipient contributor ids  

Weights in early methodology files **describe relative emphasis on statistics** for grant *discussion*, not a claim of scientific engineering value.

## Process

```
raw GitHub dataset
      ↓
normalization
      ↓
metrics calculation
      ↓
methodology (versioned)
      ↓
allocation result + human approval
```

Save all stages under `epoch-NNN/`.

## Gaming

Expect optimization of any published weight. Mitigations over time:

- Prefer merged work and reviews over raw open PRs  
- Cap extreme outliers  
- Human review for Phase 4+  
- Exclude bots / obvious spam paths  

## Versioning

`methodology/v0.1.json` is the first published schema.  
Changing weights requires a new version id and is never applied silently to a closed epoch.
