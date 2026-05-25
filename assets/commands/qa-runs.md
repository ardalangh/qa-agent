---
description: List past QA runs
---

List past QA runs. Execute:

```bash
npx qa-agent runs $ARGS
```

Arguments:
- `--last <n>` - Show last N runs (default: 10)
- `--scenario <name>` - Filter by scenario
- `--env <env>` - Filter by environment
- `--user <user>` - Filter by user
- `--failed` - Show only failed runs
- `--json` - Output as JSON

Present results in a table showing:
- Status (PASS/FAIL)
- Scenario name
- Environment
- User
- Duration
- Start time
