---
name: qa-author
description: Create new QA scenarios interactively. Use when user asks to create a new test, write a scenario, or add a test case.
disable-model-invocation: true
---

# QA Author

Help users create new QA scenarios by exploring the app interactively.

## Workflow

1. **Ask user for scenario details**:
   - What flow to test (e.g., "checkout", "login", "search")
   - Which environment to explore
   - Which user role

2. **Open the app in headed mode**:
   ```bash
   agent-browser --headed open "{baseUrl}/starting-page"
   ```

3. **Take a snapshot to see available elements**:
   ```bash
   agent-browser snapshot -i
   ```

4. **Guide the user through the flow**, taking snapshots at each step to identify selectors.

5. **Generate the scenario YAML** based on the steps discovered.

## Example Session

```bash
# Start exploring
agent-browser --session qa-author --headed open https://staging.example.com/

# Get page structure
agent-browser --session qa-author snapshot -i

# Interact based on snapshot refs
agent-browser --session qa-author click @e5

# Take annotated screenshot
agent-browser --session qa-author screenshot --annotate

# When done
agent-browser --session qa-author close
```

## Generated Scenario Template

```yaml
name: <flow-name>
description: <what this scenario tests>
tags: [<relevant-tags>]

requires:
  env: <environment or any>
  user_role: <role if login needed>

steps:
  - open: "{baseUrl}/<path>"
  - wait: { load: networkidle }

  # Add steps discovered during exploration
  - find: { label: "<label>", action: <action>, value: "<value>" }
  - expect: { visible: "<selector>" }

  - screenshot: <scenario-name>.png
```

## Best Practices for Scenario Creation

1. **Use semantic selectors**: Prefer `find label`, `find role`, `find testid` over CSS selectors
2. **Add waits after navigation**: Always `wait: { load: networkidle }` after `open`
3. **Verify state with expects**: Add assertions after key actions
4. **Take screenshots at checkpoints**: Document important states
5. **Use descriptive names**: `checkout-happy-path` not `test1`
6. **Tag appropriately**: Use tags like `smoke`, `regression`, feature names

## Save the Scenario

Save to `qa/scenarios/<scenario-name>.yaml`. Files starting with `_` are ignored.
