---
description: View a QA run report
---

View a QA run report. Execute:

```bash
npx qa-agent report $RUN_ID
```

If no run ID is provided, shows the latest run report.

Arguments:
- `[run-id]` - Optional run ID (defaults to latest)
- `--json` - Output as JSON

Present the report contents, highlighting:
1. Pass/fail status
2. Duration and timing
3. Which steps passed/failed
4. Links to artifacts (screenshots, video, HAR)
