# QA Agent CLI Reference

## Commands

### Run Scenarios

```bash
npx qa-agent run <scenario>
  -e, --env <env>      Environment to run against
  -u, --user <user>    User ID or role
  --headed             Show browser window
  --json               Output result as JSON
```

### List Resources

```bash
npx qa-agent list
  --scenarios          List scenarios only
  --users              List users only
  --envs               List environments only
  --json               Output as JSON
```

### View Runs

```bash
npx qa-agent runs
  -n, --last <n>       Show last N runs (default: 10)
  -s, --scenario <s>   Filter by scenario
  -e, --env <env>      Filter by environment
  -u, --user <user>    Filter by user
  --failed             Show only failed runs
  --json               Output as JSON
```

### Trends

```bash
npx qa-agent trend
  -d, --days <days>    Number of days (default: 30)
  -s, --scenario <s>   Filter by scenario
  --json               Output as JSON
```

### Report

```bash
npx qa-agent report [runId]
  --json               Output report data as JSON
```

### Clean

```bash
npx qa-agent clean
  -n, --keep-last <n>  Keep last N runs
  --older-than <days>  Remove runs older than N days
  --dry-run            Preview without removing
```

### Setup

```bash
npx qa-agent init      # Install QA agent into project
npx qa-agent update    # Update assets to latest version
npx qa-agent doctor    # Check installation
```

## Scenario YAML Schema

```yaml
name: scenario-name           # Required
description: "..."            # Optional
tags: [smoke, checkout]       # Optional

requires:
  env: staging                # Or: any, [staging, prod]
  user_role: customer         # Match user by role

viewport:
  w: 1440
  h: 900

setup:
  - login: true               # Use user's auth

steps:
  # Navigation
  - open: "{baseUrl}/path"
  - back: true
  - forward: true
  - reload: true

  # Wait
  - wait: { load: networkidle }
  - wait: { url: "**/dashboard" }
  - wait: { text: "Welcome" }
  - wait: { selector: "#content" }
  - sleep: 2000

  # Interaction
  - click: "#button"
  - fill: { selector: "#email", value: "test@example.com" }
  - type: { selector: "#search", value: "query" }
  - press: "Enter"
  - select: { selector: "#country", value: "US" }
  - check: "#agree"
  - uncheck: "#newsletter"
  - hover: ".menu"
  - focus: "#input"

  # Find (semantic selectors)
  - find: { label: "Email", action: fill, value: "test@example.com" }
  - find: { role: button, name: "Submit", action: click }
  - find: { testid: "submit-btn", action: click }
  - find: { placeholder: "Search...", action: fill, value: "query" }

  # Assertions
  - expect: { visible: "#content" }
  - expect: { not_visible: ".loading" }
  - expect: { enabled: "#submit" }
  - expect: { checked: "#agree" }
  - expect: { url: "**/dashboard" }
  - expect: { url_contains: "/dashboard" }
  - expect: { title_contains: "Dashboard" }
  - expect: { text: { selector: "h1", equals: "Welcome" } }
  - expect: { text: { selector: "h1", contains: "Welcome" } }
  - expect: { count: { selector: ".item", equals: 5 } }
  - expect: { count: { selector: ".item", gte: 1 } }
  - expect: { value: { selector: "#email", equals: "test@example.com" } }
  - expect: { attr: { selector: "a", name: "href", contains: "/home" } }

  # Capture
  - screenshot: filename.png
  - screenshot: { path: "full.png", full: true, annotate: true }
  - snapshot: true

  # Config
  - set_viewport: { w: 1920, h: 1080 }
  - set_headers: { "X-Test": "true" }
  - cookies_clear: true
  - storage_clear: local

recording:
  video: on-failure           # always | on-failure | off
  har: always
  console: always
  trace: off
  snapshot: per-step
```
