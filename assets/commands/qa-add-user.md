---
description: Add a new QA test user
---

Add a new user to qa/users.yaml. Use the qa-config skill.

Ask the user for:
1. User ID (unique identifier)
2. Role (customer, admin, etc.)
3. Email (optional)
4. Authentication method:
   - Environment variable for password (`password_env`)
   - Agent-browser auth vault entry (`auth_vault`)
   - State file path (`state_file`)

IMPORTANT: Never store passwords directly in the YAML file!

After gathering info, add the user entry to qa/users.yaml.
