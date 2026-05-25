---
description: List QA scenarios, users, and environments
---

List available QA resources. Execute:

```bash
npx qa-agent list
```

To filter:
- `npx qa-agent list --scenarios` - Show only scenarios
- `npx qa-agent list --users` - Show only users
- `npx qa-agent list --envs` - Show only environments

Options:
- `--json` - Output as JSON (for scripting)
- `--no-prompt` - Don't prompt to edit placeholder values

Present the results in a clear format showing:
- Scenario names and their tags
- User IDs and roles
- Environment names and base URLs

When placeholder values (like `example.com`) are detected, the command will offer to update them interactively.
