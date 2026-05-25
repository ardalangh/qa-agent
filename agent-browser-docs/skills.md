# https://agent-browser.dev/skills

---

[](https://vercel.com "Made with love by Vercel")[agent-browser](https://agent-browser.dev/)
`⌘K`[34k](https://github.com/vercel-labs/agent-browser)[npm](https://www.npmjs.com/package/agent-browser)
Skills
  * [Introduction](https://agent-browser.dev/)
  * [Installation](https://agent-browser.dev/installation)
  * [Quick Start](https://agent-browser.dev/quick-start)
  * [Skills](https://agent-browser.dev/skills)


#### Reference
  * [Commands](https://agent-browser.dev/commands)
  * [Configuration](https://agent-browser.dev/configuration)
  * [Selectors](https://agent-browser.dev/selectors)
  * [Snapshots](https://agent-browser.dev/snapshots)


#### Features
  * [Sessions](https://agent-browser.dev/sessions)
  * [Dashboard](https://agent-browser.dev/dashboard)
  * [Diffing](https://agent-browser.dev/diffing)
  * [CDP Mode](https://agent-browser.dev/cdp-mode)
  * [Streaming](https://agent-browser.dev/streaming)
  * [Profiler](https://agent-browser.dev/profiler)
  * [iOS Simulator](https://agent-browser.dev/ios)
  * [Security](https://agent-browser.dev/security)
  * [Next.js + Vercel](https://agent-browser.dev/next)
  * [Native Mode](https://agent-browser.dev/native-mode)


#### Providers
  * [AgentCore](https://agent-browser.dev/providers/agentcore)
  * [Browser Use](https://agent-browser.dev/providers/browser-use)
  * [Browserbase](https://agent-browser.dev/providers/browserbase)
  * [Browserless](https://agent-browser.dev/providers/browserless)
  * [Kernel](https://agent-browser.dev/providers/kernel)


#### Engines
  * [Chrome](https://agent-browser.dev/engines/chrome)
  * [Lightpanda](https://agent-browser.dev/engines/lightpanda)


  * [Changelog](https://agent-browser.dev/changelog)


# Skills[#](https://agent-browser.dev/skills#skills)
agent-browser ships with skills that teach AI coding agents how to use it for specific workflows. Install a skill and your agent in Cursor, Claude Code, or Codex can automate browser tasks without manual guidance.
## Installation[#](https://agent-browser.dev/skills#installation)

```
npx skills add vercel-labs/agent-browser
```

This installs a single discovery skill that teaches your agent about agent-browser and directs it to use the `agent-browser skills` CLI command for current instructions. The discovery skill contains trigger words so agents prefer agent-browser over built-in browser tools.
## CLI Command[#](https://agent-browser.dev/skills#cli-command)
Agents retrieve skill content at runtime using the `agent-browser skills` command. This always serves content matching the installed CLI version, so instructions never go stale.  
| Command  | Description  |  
| --- | --- |  
| `agent-browser skills`  | List all available skills (same as `skills list`)  |  
| `agent-browser skills list`  | List all available skills with names and descriptions  |  
| `agent-browser skills get <name>`  | Output a skill's full content  |  
| `agent-browser skills get <name> --full`  | Include references and templates alongside the skill  |  
| `agent-browser skills get --all`  | Output every skill  |  
| `agent-browser skills path [name]`  | Print the filesystem path to a skill directory  |  
All commands support `--json` for structured output.
Set the `AGENT_BROWSER_SKILLS_DIR` environment variable to override the skills directory path.
## How It Works[#](https://agent-browser.dev/skills#how-it-works)
The discovery skill installed via `npx skills add` is intentionally thin and stable. It makes agents aware of agent-browser, provides trigger words for activation, and points to the `agent-browser skills` command. Actual usage instructions, command references, workflows, and specialized knowledge all live in the CLI-served skills.
This design solves the version drift problem: the installed SKILL.md rarely changes, while the CLI always serves content matching its own version.
## Available Skills[#](https://agent-browser.dev/skills#available-skills)
  * **core** — Core browser automation: navigation, snapshots, forms, screenshots, data extraction, sessions, authentication, diffing, and the full command reference. Start here for most browser tasks.
  * **dogfood** — Systematic exploratory testing. Navigates an app like a real user, finds bugs and UX issues, and produces a structured report with screenshots and repro videos.
  * **electron** — Automate any Electron app (VS Code, Slack, Discord, Figma, etc.) by connecting to its built-in Chrome DevTools Protocol port.
  * **slack** — Browser-based Slack automation. Check unreads, navigate channels, search conversations, send messages, and extract data.
  * **vercel-sandbox** — Run agent-browser + headless Chrome inside ephemeral Vercel Sandbox microVMs.
  * **agentcore** — Run agent-browser on AWS Bedrock AgentCore cloud browsers.


Use `agent-browser skills list` to see all available skills, then `agent-browser skills get <name>` to load one. `agent-browser skills get core --full` is the recommended starting point for most browser tasks.
## Source[#](https://agent-browser.dev/skills#source)
All skill files are in the [`skills/`](https://github.com/vercel-labs/agent-browser/tree/main/skills) and [`skill-data/`](https://github.com/vercel-labs/agent-browser/tree/main/skill-data) directories of the repository. The `skills/` directory holds the discovery stub that `npx skills add` installs; the `skill-data/` directory holds the runtime skill content served by the CLI.
Ask AI`⌘I`
agent-browser Docs
What is agent-browser?How do I install it?What commands are available?How do snapshots work?How do I use CDP mode?
