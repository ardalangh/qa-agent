---
description: Show QA pass rate trends
---

Show pass rate trends for QA scenarios. Execute:

```bash
npx qa-agent trend $ARGS
```

Arguments:
- `--days <n>` - Number of days to analyze (default: 30)
- `--scenario <name>` - Filter by scenario
- `--json` - Output as JSON

Present:
1. Overall pass rate
2. Pass rate by scenario
3. Any scenarios with declining pass rates
