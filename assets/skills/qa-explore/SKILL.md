---
name: qa-explore
description: Exploratory testing using LLM-driven browser automation. Use when user asks to explore the app, find bugs, do exploratory testing, or test an area interactively.
disable-model-invocation: true
---

# QA Explore

Perform LLM-driven exploratory testing on the app. Navigate like a real user, find bugs, and produce a structured report.

## Quick Start

```bash
# Load the agent-browser dogfood skill for exploratory testing guidance
agent-browser skills get dogfood --full
```

## Workflow

1. **Determine the scope**:
   - Which environment? (staging, prod, etc.)
   - Which area of the app to explore?
   - Which user persona?

2. **Start a browser session**:
   ```bash
   agent-browser --session explore --headed open {baseUrl}
   ```

3. **Systematically explore**:
   - Navigate through the app
   - Try different inputs
   - Look for edge cases
   - Test error states
   - Check responsive behavior

4. **Document findings** in `qa/runs/<timestamp>/exploration.md`

## Exploration Strategy

1. **Happy paths**: Test normal user flows
2. **Edge cases**: Empty states, long inputs, special characters
3. **Error handling**: Invalid inputs, network errors
4. **Navigation**: Deep links, back button, refresh
5. **Responsive**: Different viewport sizes

## Commands for Exploration

```bash
# Navigate
agent-browser open {url}
agent-browser back
agent-browser forward
agent-browser reload

# Inspect
agent-browser snapshot -i          # Get interactive elements
agent-browser screenshot --annotate # Visual reference

# Interact
agent-browser click @e1
agent-browser fill @e2 "test input"
agent-browser press "Enter"

# Test different viewports
agent-browser set viewport 375 812  # Mobile
agent-browser set viewport 768 1024 # Tablet
agent-browser set viewport 1920 1080 # Desktop
```

## Bug Report Template

When you find an issue, document it:

```markdown
## Bug: [Short description]

**Severity**: Critical / High / Medium / Low
**Environment**: staging
**User**: customer-a

### Steps to Reproduce
1. Navigate to {url}
2. Click on {element}
3. Enter {input}

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happened]

### Screenshot
[Path to screenshot]

### Additional Notes
[Any relevant context]
```

## Example Exploration Session

```bash
# Start session
agent-browser --session explore --headed open https://staging.example.com/

# Take initial snapshot
agent-browser --session explore snapshot -i

# Explore navigation
agent-browser --session explore click @e3  # Nav link
agent-browser --session explore wait --load networkidle
agent-browser --session explore snapshot -i

# Test form with edge cases
agent-browser --session explore fill @e5 ""  # Empty
agent-browser --session explore fill @e5 "a"  # Single char
agent-browser --session explore fill @e5 "a".repeat(1000)  # Very long

# Test mobile view
agent-browser --session explore set viewport 375 812
agent-browser --session explore screenshot mobile.png

# Clean up
agent-browser --session explore close
```
