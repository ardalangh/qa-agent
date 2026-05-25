---
description: Exploratory testing with LLM-driven browser automation
---

Perform exploratory testing on the app. Use the qa-explore skill.

Arguments:
- `<env>` - Environment to explore (staging, prod, etc.)
- `--user <user>` - User to explore as (optional)
- `--area <path>` - Specific area/path to focus on (optional)

Steps:
1. Start a browser session with agent-browser in headed mode
2. Systematically explore the specified area
3. Test edge cases, error states, and different inputs
4. Document any bugs or issues found
5. Save findings to `qa/runs/<timestamp>/exploration.md`
