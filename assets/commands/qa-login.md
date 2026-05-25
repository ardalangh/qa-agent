---
description: Test login for a QA user
---

Test that a user can authenticate successfully. Execute:

```bash
agent-browser --session qa-login-test auth login $USER_AUTH_VAULT
```

Or if using state file:
```bash
agent-browser --session qa-login-test state load $STATE_FILE
agent-browser --session qa-login-test open $BASE_URL
```

Arguments:
- `<user>` - User ID from qa/users.yaml
- `--env <env>` - Environment to test against (optional)

Report the login status and any errors encountered.
