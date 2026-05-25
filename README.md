# QA Agent

Reusable QA agent for **Cursor** and **Claude Code**. Define test users, environments, and scenarios in YAML, then run them via [agent-browser](https://agent-browser.dev/) from chat or CI.

## Installation

```bash
# Install into your project (from npm)
npx @ardygh/qa-agent init

# Or install for specific platform only
npx @ardygh/qa-agent init --cursor
npx @ardygh/qa-agent init --claude

# Alternative: install from GitHub
npx github:ardalangh/qa-agent init
```

This installs:
- Skills for Cursor/Claude (`.cursor/skills/`, `.claude/skills/`)
- Slash commands (`.cursor/commands/`, `.claude/commands/`)
- Rules for code assistance (`.cursor/rules/`)
- Template config files (`qa/`)

**Prerequisite**: [agent-browser](https://agent-browser.dev/) must be installed:
```bash
npm i -g agent-browser
agent-browser install  # Downloads Chrome
```

## Quick Start

1. **Define test users** in `qa/users.yaml`:
   ```yaml
   users:
     - id: customer-a
       role: customer
       email: test@example.com
       password_env: QA_CUSTOMER_PASSWORD  # Never inline passwords!
   ```

2. **Define environments** in `qa/environments.yaml`:
   ```yaml
   environments:
     staging:
       baseUrl: https://staging.example.com
       allowedDomains: [staging.example.com]
   ```

3. **Create a scenario** in `qa/scenarios/login.yaml`:
   ```yaml
   name: login-happy-path
   description: User can log in successfully
   
   requires:
     user_role: customer
   
   steps:
     - open: "{baseUrl}/login"
     - wait: { load: networkidle }
     - find: { label: "Email", action: fill, value: "test@example.com" }
     - find: { label: "Password", action: fill, value: "secret" }
     - find: { role: button, name: "Sign in", action: click }
     - wait: { url: "**/dashboard" }
     - expect: { visible: "[data-testid='user-menu']" }
     - screenshot: logged-in.png
   ```

4. **Run it** from Cursor/Claude chat:
   ```
   /qa-run login --env staging
   ```

   Or from the command line:
   ```bash
   npx @ardygh/qa-agent run login --env staging
   ```

## Slash Commands

| Command | Description |
|---------|-------------|
| `/qa-run <scenario>` | Run a scenario |
| `/qa-list` | List scenarios, users, environments |
| `/qa-new` | Create a new scenario interactively |
| `/qa-explore <env>` | Exploratory testing |
| `/qa-report` | View latest run report |
| `/qa-runs` | List past runs |
| `/qa-trend` | Show pass rate trends |
| `/qa-clean` | Remove old run artifacts |
| `/qa-add-user` | Add a test user |
| `/qa-add-env` | Add an environment |

## CLI Commands

```bash
npx @ardygh/qa-agent run <scenario> [--env <env>] [--user <user>] [--headed]
npx @ardygh/qa-agent list [--scenarios|--users|--envs]
npx @ardygh/qa-agent runs [--last N] [--failed] [--scenario X]
npx @ardygh/qa-agent trend [--days 30] [--scenario X]
npx @ardygh/qa-agent report [run-id]
npx @ardygh/qa-agent clean [--keep-last N] [--older-than 30d]
npx @ardygh/qa-agent doctor
npx @ardygh/qa-agent update
```

## Scenario YAML Reference

### Step Types

**Navigation:**
```yaml
- open: "{baseUrl}/path"
- back: true
- forward: true
- reload: true
```

**Wait:**
```yaml
- wait: { load: networkidle }
- wait: { url: "**/dashboard" }
- wait: { text: "Welcome" }
- wait: { selector: "#content", state: visible }
- sleep: 2000
```

**Interaction:**
```yaml
- click: "#button"
- fill: { selector: "#email", value: "test@example.com" }
- type: { selector: "#search", value: "query" }
- press: "Enter"
- select: { selector: "#country", value: "US" }
- check: "#agree"
- hover: ".menu"
```

**Semantic Find (recommended):**
```yaml
- find: { label: "Email", action: fill, value: "test@example.com" }
- find: { role: button, name: "Submit", action: click }
- find: { testid: "submit-btn", action: click }
- find: { placeholder: "Search...", action: fill, value: "query" }
```

**Assertions:**
```yaml
- expect: { visible: "#content" }
- expect: { not_visible: ".loading" }
- expect: { url: "**/dashboard" }
- expect: { title_contains: "Dashboard" }
- expect: { text: { selector: "h1", equals: "Welcome" } }
- expect: { count: { selector: ".item", gte: 1 } }
```

**Capture:**
```yaml
- screenshot: filename.png
- screenshot: { path: "full.png", full: true, annotate: true }
- snapshot: true
```

## Run Artifacts

Each run creates a directory in `qa/runs/<run-id>/`:
- `result.json` - Structured pass/fail data
- `report.md` - Human-readable report
- `screenshots/` - Per-step screenshots
- `snapshots/` - Accessibility tree snapshots
- `video.webm` - Session recording (if enabled)
- `network.har` - Network log
- `console.json` - Browser console messages

View the summary: `qa/runs/SUMMARY.md`

## Security

- **Never inline passwords** in YAML files
- Use `password_env` to reference environment variables
- Use `auth_vault` for agent-browser auth entries
- Use `state_file` for exported sessions (store in `qa/.secrets/`, which is gitignored)

## Configuration Files

| File | Purpose |
|------|---------|
| `qa/users.yaml` | Test user definitions |
| `qa/environments.yaml` | Environment configs |
| `qa/scenarios/*.yaml` | Test scenarios |
| `qa/runs.config.yaml` | Retention and notification sinks |
| `qa/agent-browser.json` | Browser settings |

## GitHub-Direct Install

You can also install directly from GitHub without npm publish:

```bash
npx github:ardalangh/qa-agent init
```

## License

MIT
