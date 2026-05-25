
## QA Agent

This project uses **QA Agent** for browser-based testing. QA scenarios are defined in `qa/scenarios/*.yaml` and run via `agent-browser`.

### Available Skills
- **qa-runner**: Run QA scenarios (`/qa-run`)
- **qa-author**: Create new scenarios interactively (`/qa-new`)
- **qa-explore**: Exploratory testing (`/qa-explore`)
- **qa-config**: Configure users and environments

### Quick Commands
```bash
npx qa-agent run <scenario>      # Run a scenario
npx qa-agent list                # List scenarios, users, envs
npx qa-agent report              # View latest run report
npx qa-agent runs                # List recent runs
```

### Key Files
- `qa/users.yaml` - Test user definitions (never inline passwords!)
- `qa/environments.yaml` - Environment configurations
- `qa/scenarios/*.yaml` - Test scenario definitions
- `qa/runs/SUMMARY.md` - Run history summary
