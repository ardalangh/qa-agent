# https://agent-browser.dev/installation

---

[](https://vercel.com "Made with love by Vercel")[agent-browser](https://agent-browser.dev/)
`⌘K`[34k](https://github.com/vercel-labs/agent-browser)[npm](https://www.npmjs.com/package/agent-browser)
Installation
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


# Installation[#](https://agent-browser.dev/installation#installation)
## Global installation (recommended)[#](https://agent-browser.dev/installation#global-installation-recommended)
Installs the native Rust binary for maximum performance:

```
npm install -g agent-browser
agent-browser install  # Download Chrome from Chrome for Testing (first time)
```

This is the fastest option -- commands run through the native Rust CLI directly with sub-millisecond parsing overhead.
## Quick start (no install)[#](https://agent-browser.dev/installation#quick-start-no-install)

```
npx agent-browser install   # Download Chrome (first time only)
npx agent-browser open example.com
```

## Project installation (local dependency)[#](https://agent-browser.dev/installation#project-installation-local-dependency)
For projects that want to pin the version in `package.json`:

```
npm install agent-browser
npx agent-browser install  # Download Chrome (first time)
```

Then use via `npx` or `package.json` scripts.
## Homebrew (macOS)[#](https://agent-browser.dev/installation#homebrew-macos)

```
brew install agent-browser
agent-browser install  # Download Chrome (first time)
```

## Cargo (Rust)[#](https://agent-browser.dev/installation#cargo-rust)

```
cargo install agent-browser
agent-browser install  # Download Chrome (first time)
```

Compiles from source (~2-3 min). Requires Node.js 24+, pnpm 11+, and the Rust toolchain ([rustup.rs](https://rustup.rs)).
## From source[#](https://agent-browser.dev/installation#from-source)

```
git clone https://github.com/vercel-labs/agent-browser
cd agent-browser
pnpm install
pnpm build
pnpm build:native
./bin/agent-browser install
pnpm link --global
```

## Linux dependencies[#](https://agent-browser.dev/installation#linux-dependencies)
On Linux, install system dependencies:

```
agent-browser install --with-deps
```

## Updating[#](https://agent-browser.dev/installation#updating)
Upgrade to the latest version:

```
agent-browser upgrade
```

Detects your installation method (npm, Homebrew, or Cargo) and runs the appropriate update command automatically. Displays the version change on success, or informs you if you are already on the latest version.
## Doctor[#](https://agent-browser.dev/installation#doctor)
`doctor` diagnoses your install and auto-cleans stale daemon files. Run it whenever something stops working unexpectedly, or after upgrades:

```
agent-browser doctor                     # Full diagnosis
agent-browser doctor --offline --quick   # Local-only, fastest (~<1s)
agent-browser doctor --fix               # Also run destructive repairs
agent-browser doctor --json              # Structured output
```

It checks:  
| Category  | What it checks  |  
| --- | --- |  
| Environment  | CLI version, platform, home directory, state and socket dirs, free disk space  |  
| Chrome  | Chrome install path and version, cache dir, Puppeteer fallback, user-data dir and profile count, optional `lightpanda` engine  |  
| Daemons  | Running daemons per session, stale `.sock` / `.pid` / `.version` / `.stream` files (auto-cleaned), version mismatch with the CLI, dashboard process liveness  |  
| Config  |  `~/.agent-browser/config.json`, `./agent-browser.json`, and any file at `AGENT_BROWSER_CONFIG` parse as valid JSON  |  
| Security  | Encryption key env var or `~/.agent-browser/.encryption-key` (with 0600 permissions on unix), state file count and age vs `AGENT_BROWSER_STATE_EXPIRE_DAYS`, action policy file  |  
| Providers  | Env vars for Browserless, Browserbase, Browser Use, Kernel, AgentCore (AWS creds), Appium (for `--provider ios`), and `AI_GATEWAY_API_KEY` for chat  |  
| Network  | Reachability of the Chrome for Testing CDN, AI Gateway (if configured), and any currently selected provider endpoint (skipped under `--offline`)  |  
| Launch test  | Spawns a scratch session, launches headless Chrome, navigates to `about:blank`, then closes. Measures wall time (skipped under `--quick`)  |  
Stale sidecar files are always cleaned. Destructive actions are opt-in via `--fix`:  
| Check  | What `--fix` does  |  
| --- | --- |  
| Chrome missing  | Runs `agent-browser install`  |  
| Version-mismatched daemons  | Sends `close` to each and cleans files  |  
| Old state files  | Deletes state files older than `AGENT_BROWSER_STATE_EXPIRE_DAYS` (default 30)  |  
| Missing encryption key  | Generates a new key at `~/.agent-browser/.encryption-key` (0600, unix); never overwrites an existing key  |  
Exit code is `0` if all checks pass (warnings are fine), `1` if any fail.
## Custom browser[#](https://agent-browser.dev/installation#custom-browser)
Use a custom browser executable instead of bundled Chromium:
  * **Serverless** - Use `@sparticuz/chromium` (~50MB vs ~684MB)
  * **System browser** - Use existing Chrome installation
  * **Custom builds** - Use modified browser builds



```
# Via flag
agent-browser --executable-path /path/to/chromium open example.com

# Via environment variable
AGENT_BROWSER_EXECUTABLE_PATH=/path/to/chromium agent-browser open example.com
```

### Serverless example[#](https://agent-browser.dev/installation#serverless-example)
Use `@sparticuz/chromium` or similar to obtain a Chromium executable path, then pass it via `--executable-path` or `AGENT_BROWSER_EXECUTABLE_PATH`.
## AI agent setup[#](https://agent-browser.dev/installation#ai-agent-setup)
agent-browser works with any AI agent out of the box. For richer context:
### AI coding assistants (recommended)[#](https://agent-browser.dev/installation#ai-coding-assistants-recommended)
Install the skill for your AI coding assistant:

```
npx skills add vercel-labs/agent-browser
```

This works with Claude Code, Codex, Cursor, Gemini CLI, GitHub Copilot, Goose, OpenCode, and Windsurf. The skill is fetched from the repository and stays up to date automatically.
> **Do not** copy `SKILL.md` from `node_modules` -- it will become stale as new features are added. Always use `npx skills add` or reference the repository version.
### AGENTS.md / CLAUDE.md[#](https://agent-browser.dev/installation#agentsmd-claudemd)
Add to your instructions file:

```
## Browser Automation

Use `agent-browser` for web automation. Run `agent-browser --help` for all commands.

Core workflow:
1. `agent-browser open <url>` - Navigate to page
2. `agent-browser snapshot -i` - Get interactive elements with refs (@e1, @e2)
3. `agent-browser click @e1` / `fill @e2 "text"` - Interact using refs
4. Re-snapshot after page changes
```

Ask AI`⌘I`
agent-browser Docs
What is agent-browser?How do I install it?What commands are available?How do snapshots work?How do I use CDP mode?
