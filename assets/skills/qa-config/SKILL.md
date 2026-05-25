---
name: qa-config
description: Configure QA agent users, environments, and settings. Use when user asks to add a user, add an environment, configure QA settings, or edit qa/*.yaml files.
disable-model-invocation: true
---

# QA Config

Manage QA agent configuration: users, environments, and run settings.

## Files

| File | Purpose |
|------|---------|
| `qa/users.yaml` | Test user definitions |
| `qa/environments.yaml` | Environment configurations |
| `qa/runs.config.yaml` | Run retention and sinks |
| `qa/agent-browser.json` | Browser settings |

## Adding a User

Edit `qa/users.yaml`:

```yaml
users:
  - id: new-user               # Unique identifier
    role: customer             # Role for scenario matching
    email: user@example.com    # Optional: for display
    password_env: QA_USER_PASS # NEVER inline passwords!
    notes: "Description"

  # With auth vault (recommended)
  - id: admin
    role: admin
    auth_vault: admin-user     # Created via agent-browser auth save

  # With state file (for SSO/2FA)
  - id: sso-user
    role: enterprise
    state_file: qa/.secrets/sso.state.json
```

**IMPORTANT**: Never store passwords directly in YAML files. Use:
- `password_env`: Reference an environment variable
- `auth_vault`: Reference an agent-browser auth entry
- `state_file`: Reference an exported session state

### Creating Auth Vault Entry

```bash
# Save credentials to agent-browser auth vault
echo "$PASSWORD" | agent-browser auth save my-user \
  --url https://app.example.com/login \
  --username user@example.com \
  --password-stdin \
  --username-selector "#email" \
  --password-selector "#password" \
  --submit-selector "button[type=submit]"
```

### Creating State File

```bash
# Export authenticated session
agent-browser --headed open https://app.example.com/login
# ... manually log in ...
agent-browser state save qa/.secrets/my-user.state.json
```

## Adding an Environment

Edit `qa/environments.yaml`:

```yaml
environments:
  new-env:
    baseUrl: https://new-env.example.com
    provider: null                    # null = local Chrome
    config: qa/agent-browser.json
    allowedDomains:
      - new-env.example.com
      - "*.cdn.example.com"
    headers: {}                       # Optional default headers
    requires_confirm: false           # true = require explicit --env
    recording:
      video: on-failure
      har: always
      console: always
      trace: off
      snapshot: per-step

default: staging  # Default when --env not specified
```

### Provider Options

- `null` - Local Chrome (default)
- `browserbase` - Browserbase cloud browser
- `browserless` - Browserless cloud browser
- `kernel` - Kernel cloud browser

## Configuring Retention & Sinks

Edit `qa/runs.config.yaml`:

```yaml
storage:
  retention:
    keep_last: 50
    keep_days: 30

  sinks:
    # Slack notifications
    - type: slack
      channel: "#qa-alerts"
      notify_on: [failure]

    # Linear issues
    - type: linear
      team: ENG
      labels: [qa, automated]
      create_issue_on: [failure]

    # S3 backup
    - type: s3
      bucket: my-qa-bucket
      prefix: runs/
      credentials_env: AWS_PROFILE
      notify_on: [always]
```

## Validation

After editing configs, verify with:

```bash
npx qa-agent doctor  # Check overall setup
npx qa-agent list    # List users, envs, scenarios
```

## Security Guidelines

1. **Never commit secrets**: Add `qa/.secrets/` to `.gitignore`
2. **Use env vars for passwords**: `password_env: QA_USER_PASSWORD`
3. **Use auth vault**: Credentials stored encrypted locally
4. **Use state files for SSO**: Export sessions that can't use vault
5. **Limit allowed domains**: Prevent data exfiltration in tests
