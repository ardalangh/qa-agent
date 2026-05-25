---
name: qa-runner
description: Run QA scenarios via agent-browser. Use when the user asks to run QA, test a scenario, smoke test the app, run tests, or references qa/scenarios/** files.
---

# QA Runner

Run QA scenarios defined in `qa/scenarios/*.yaml` using agent-browser.

## Quick Start

```bash
# Run a scenario
npx qa-agent run <scenario-name>

# Run with specific environment and user
npx qa-agent run checkout --env staging --user customer-a

# Run in headed mode (visible browser)
npx qa-agent run login --headed
```

## Workflow

1. **List available scenarios**: `npx qa-agent list --scenarios`
2. **Run a scenario**: `npx qa-agent run <name> [--env <env>] [--user <user>]`
3. **View results**: `npx qa-agent report` or check `qa/runs/SUMMARY.md`

## Run Output

Each run creates a directory in `qa/runs/<run-id>/` containing:
- `result.json` - Structured pass/fail per step with timings
- `report.md` - Human-readable report with artifact links
- `screenshots/` - Per-step screenshots
- `snapshots/` - Accessibility tree snapshots
- `video.webm` - Session recording (if enabled)
- `network.har` - Network log
- `console.json` - Browser console messages

## Example Response to User

After running a scenario, summarize:
- **Status**: PASS or FAIL
- **Duration**: How long it took
- **Link to report**: `qa/runs/<run-id>/report.md`
- **Link to summary**: `qa/runs/SUMMARY.md`

If the run failed, show:
- Which step failed
- The error message
- Path to the failure screenshot

## Common Commands

```bash
npx qa-agent run <scenario>           # Run scenario
npx qa-agent run <scenario> --env staging --user admin
npx qa-agent runs                      # List recent runs
npx qa-agent runs --failed             # Show only failures
npx qa-agent report                    # View latest report
npx qa-agent trend                     # Show pass rate trends
npx qa-agent list                      # List scenarios, users, envs
```

## Additional Resources

- For CLI reference, see [reference.md](reference.md)
- For scenario examples, see [examples.md](examples.md)
