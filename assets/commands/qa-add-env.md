---
description: Add a new QA test environment
---

Add a new environment to qa/environments.yaml. Use the qa-config skill.

Ask the user for:
1. Environment ID (staging, prod, dev, etc.)
2. Base URL
3. Provider (null for local Chrome, or: browserbase, browserless, kernel)
4. Allowed domains (for security)
5. Whether to require confirmation before running (`requires_confirm`)

After gathering info, add the environment entry to qa/environments.yaml.
