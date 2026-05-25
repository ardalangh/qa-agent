---
description: Run a QA scenario
---

Run the specified QA scenario using agent-browser. Use the qa-runner skill.

Execute:
```bash
npx qa-agent run "$SCENARIO" $ARGS
```

Arguments:
- `<scenario>` - Name of the scenario (from qa/scenarios/)
- `--env <env>` - Environment to run against (staging, prod, etc.)
- `--user <user>` - User ID or role to run as
- `--headed` - Show browser window for debugging
- `--json` - Output result as JSON

After the run completes, summarize:
1. Pass/fail status
2. Duration
3. Link to `qa/runs/<run-id>/report.md`
4. If failed: which step failed and the error message
