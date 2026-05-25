---
description: Create a new QA scenario interactively
---

Create a new QA scenario by exploring the app interactively. Use the qa-author skill.

Steps:
1. Ask the user what flow they want to test
2. Ask which environment to explore
3. Open the app in headed mode with agent-browser
4. Take snapshots to discover available elements
5. Guide the user through the flow
6. Generate a scenario YAML file

Save the result to `qa/scenarios/<scenario-name>.yaml`.
