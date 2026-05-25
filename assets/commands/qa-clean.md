---
description: Clean old QA run artifacts
---

Clean old QA run artifacts. Execute:

```bash
npx qa-agent clean $ARGS
```

Arguments:
- `--keep-last <n>` - Keep last N runs
- `--older-than <days>` - Remove runs older than N days
- `--dry-run` - Preview without actually removing

Without arguments, uses settings from qa/runs.config.yaml.

Report how many runs were removed and how many were kept.
